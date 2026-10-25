from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from jose import jwt
import models, os, random, datetime, secrets, requests

router = APIRouter(prefix="/auth", tags=["Auth"])

SECRET_KEY = os.getenv("SECRET_KEY", "ayyanar2024secretkey")
REFRESH_SECRET = os.getenv("REFRESH_SECRET", "refresh_secret")
FAST2SMS_KEY = os.getenv("FAST2SMS_API_KEY", "")

# Memory OTP store
otp_store: dict = {}


def create_access_token(user_id: int, role: str) -> str:
    expire = datetime.datetime.utcnow() + \
             datetime.timedelta(days=7)
    return jwt.encode(
        {"sub": str(user_id), "role": role, "exp": expire},
        SECRET_KEY, algorithm="HS256"
    )


def create_refresh_token(user_id: int) -> str:
    expire = datetime.datetime.utcnow() + \
             datetime.timedelta(days=30)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire,
         "type": "refresh"},
        REFRESH_SECRET, algorithm="HS256"
    )


def send_sms(phone: str, otp: str) -> bool:
    if not FAST2SMS_KEY:
        print("No Fast2SMS key!")
        return False
    try:
        # Clean API key — ASCII only
        clean_key = FAST2SMS_KEY.encode(
            'utf-8'
        ).decode('ascii', 'ignore').strip()

        res = requests.post(
            "https://www.fast2SMS.com/dev/bulkV2",
            headers={
                "authorization": clean_key,
                "Content-Type": "application/json"
            },
            json={
                "route": "q",
                "message": f"Your OTP for Ayyanar Book Centre is {otp}",
                "numbers": phone
            },
            timeout=10
        )
        data = res.json()
        print(f"SMS response: {data}")
        return data.get("return", False)
    except Exception as e:
        print(f"SMS Error: {e}")
        return False


# ===== SEND OTP =====
@router.post("/send-otp")
def send_otp(
    data: dict,
    db: Session = Depends(get_db)
):
    phone = data.get("phone", "").strip()

    # Remove +91 if present
    if phone.startswith("+91"):
        phone = phone[3:]
    if phone.startswith("91") and len(phone) == 12:
        phone = phone[2:]

    # Validate
    if not phone or len(phone) != 10 or \
       not phone.isdigit():
        raise HTTPException(
            status_code=400,
            detail="Enter valid 10-digit phone number!"
        )

    # Check user exists
    user = db.query(models.User).filter(
        models.User.phone == phone
    ).first()

    if not user:
        # Auto-register new customer
        user = models.User(
            name=f"Customer {phone[-4:]}",
            email=f"{phone}@ayyanar.com",
            password_hash="otp_user",
            phone=phone,
            role="customer"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))

    # Store OTP (10 min expiry)
    otp_store[phone] = {
        "otp": otp,
        "user_id": user.id,
        "expires": datetime.datetime.utcnow() +
                   datetime.timedelta(minutes=10)
    }

    # Send SMS
    sms_sent = send_sms(phone, otp)

    if sms_sent:
        return {
            "message": f"OTP sent to {phone[-4:].rjust(10, '*')}",
            "status": "sent",
            "otp": None
        }
    else:
        # Fallback — show OTP (if SMS fails)
        print(f"SMS failed, OTP for {phone}: {otp}")
        return {
            "message": "OTP generated!",
            "status": "fallback",
            "otp": otp  # Remove in production!
        }


# ===== VERIFY OTP =====
@router.post("/verify-otp")
def verify_otp(
    data: dict,
    db: Session = Depends(get_db)
):
    phone = data.get("phone", "").strip()
    otp = data.get("otp", "").strip()

    if phone.startswith("+91"):
        phone = phone[3:]
    if phone.startswith("91") and len(phone) == 12:
        phone = phone[2:]

    if phone not in otp_store:
        raise HTTPException(
            status_code=400,
            detail="OTP expired! Request new OTP."
        )

    stored = otp_store[phone]

    # Check expiry
    if datetime.datetime.utcnow() > stored["expires"]:
        del otp_store[phone]
        raise HTTPException(
            status_code=400,
            detail="OTP expired! Request new OTP."
        )

    # Check OTP
    if stored["otp"] != otp:
        raise HTTPException(
            status_code=400,
            detail="Wrong OTP! Try again."
        )

    # Get user
    user = db.query(models.User).filter(
        models.User.id == stored["user_id"]
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found!"
        )

    # Clear OTP
    del otp_store[phone]

    # Generate tokens
    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)

    return {
        "token": access_token,
        "refresh_token": refresh_token,
        "name": user.name,
        "role": user.role,
        "phone": user.phone,
        "message": "Login successful!"
    }


# ===== REFRESH TOKEN =====
@router.post("/refresh")
def refresh_token(
    data: dict,
    db: Session = Depends(get_db)
):
    token = data.get("refresh_token", "")
    try:
        payload = jwt.decode(
            token, REFRESH_SECRET, algorithms=["HS256"]
        )
        user_id = int(payload.get("sub"))
        user = db.query(models.User).filter(
            models.User.id == user_id
        ).first()
        if not user:
            raise HTTPException(status_code=401,
                detail="User not found!")
        new_access = create_access_token(
            user.id, user.role
        )
        new_refresh = create_refresh_token(user.id)
        return {
            "token": new_access,
            "refresh_token": new_refresh,
            "name": user.name,
            "role": user.role
        }
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token!"
        )


# ===== GET PROFILE =====
@router.get("/profile")
def get_profile(
    db: Session = Depends(get_db)
):
    return {"message": "Profile endpoint"}


# Keep old login for admin fallback
@router.post("/login")
def login(
    data: dict,
    db: Session = Depends(get_db)
):
    raise HTTPException(
        status_code=400,
        detail="Please use phone OTP login!"
    )