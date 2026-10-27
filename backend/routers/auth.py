from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from jose import jwt
import models, os, random, datetime, requests, bcrypt

router = APIRouter(prefix="/auth", tags=["Auth"])

SECRET_KEY = os.getenv("SECRET_KEY", "ayyanar2024secretkey")
REFRESH_SECRET = os.getenv("REFRESH_SECRET", "refresh_secret")
FAST2SMS_KEY = os.getenv("FAST2SMS_API_KEY", "")

otp_store: dict = {}


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password[:72].encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain[:72].encode('utf-8'),
            hashed.encode('utf-8')
        )
    except Exception:
        return False


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
        return False
    try:
        message = (
            f"Your OTP for Ayyanar Book Centre "
            f"is {otp}. Valid for 10 minutes. "
            f"Do not share with anyone."
        )
        res = requests.post(
            "https://www.fast2sms.com/dev/bulkV2",
            headers={"authorization": FAST2SMS_KEY.strip()},
            params={
                "route": "q",
                "message": message,
                "numbers": phone,
                "flash": 0
            },
            timeout=15
        )
        data = res.json()
        print(f"SMS: {data}")
        return data.get("return", False)
    except Exception as e:
        print(f"SMS Error: {e}")
        return False


# ===== REGISTER =====
@router.post("/register")
def register(
    data: dict,
    db: Session = Depends(get_db)
):
    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    password = data.get("password", "")

    # Clean phone
    phone = phone.replace("+91", "").replace(" ", "")
    if phone.startswith("91") and len(phone) == 12:
        phone = phone[2:]

    if not name or not phone or not password:
        raise HTTPException(
            status_code=400,
            detail="Name, phone and password required!"
        )
    if len(phone) != 10 or not phone.isdigit():
        raise HTTPException(
            status_code=400,
            detail="Enter valid 10-digit phone number!"
        )
    if len(password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters!"
        )

    # Check existing
    existing = db.query(models.User).filter(
        models.User.phone == phone
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Phone number already registered!"
        )

    # Create user
    user = models.User(
        name=name,
        email=f"phone_{phone}@ayyanar.com",
        password_hash=hash_password(password),
        phone=phone,
        role="customer"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)

    return {
        "token": access_token,
        "refresh_token": refresh_token,
        "name": user.name,
        "role": user.role,
        "phone": user.phone,
        "message": "Registration successful!"
    }


# ===== LOGIN =====
@router.post("/login")
def login(
    data: dict,
    db: Session = Depends(get_db)
):
    phone = data.get("phone", "").strip()
    password = data.get("password", "")

    phone = phone.replace("+91", "").replace(" ", "")
    if phone.startswith("91") and len(phone) == 12:
        phone = phone[2:]

    if not phone or not password:
        raise HTTPException(
            status_code=400,
            detail="Phone and password required!"
        )

    user = db.query(models.User).filter(
        models.User.phone == phone
    ).first()

    if not user or not verify_password(
        password, user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Wrong phone number or password!"
        )

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


# ===== FORGOT PASSWORD — Step 1: Send OTP =====
@router.post("/forgot-password")
def forgot_password(
    data: dict,
    db: Session = Depends(get_db)
):
    phone = data.get("phone", "").strip()
    phone = phone.replace("+91", "").replace(" ", "")
    if phone.startswith("91") and len(phone) == 12:
        phone = phone[2:]

    if not phone or len(phone) != 10:
        raise HTTPException(
            status_code=400,
            detail="Enter valid phone number!"
        )

    user = db.query(models.User).filter(
        models.User.phone == phone
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Phone number not registered!"
        )

    otp = str(random.randint(100000, 999999))
    otp_store[f"reset_{phone}"] = {
        "otp": otp,
        "user_id": user.id,
        "expires": datetime.datetime.utcnow() +
                   datetime.timedelta(minutes=10)
    }

    sent = send_sms(phone, otp)

    return {
        "message": "OTP sent!" if sent
                   else "OTP generated!",
        "status": "sent" if sent else "fallback",
        "otp": None if sent else otp
    }


# ===== FORGOT PASSWORD — Step 2: Verify OTP =====
@router.post("/verify-reset-otp")
def verify_reset_otp(
    data: dict,
    db: Session = Depends(get_db)
):
    phone = data.get("phone", "").strip()
    phone = phone.replace("+91", "").replace(" ", "")
    otp = data.get("otp", "").strip()

    key = f"reset_{phone}"
    if key not in otp_store:
        raise HTTPException(
            status_code=400,
            detail="OTP expired! Request again."
        )

    stored = otp_store[key]

    if datetime.datetime.utcnow() > stored["expires"]:
        del otp_store[key]
        raise HTTPException(
            status_code=400,
            detail="OTP expired! Request again."
        )

    if stored["otp"] != otp:
        raise HTTPException(
            status_code=400,
            detail="Wrong OTP! Try again."
        )

    import secrets
    reset_token = secrets.token_urlsafe(32)
    otp_store[f"token_{reset_token}"] = {
        "user_id": stored["user_id"],
        "expires": datetime.datetime.utcnow() +
                   datetime.timedelta(minutes=15)
    }
    del otp_store[key]

    return {
        "reset_token": reset_token,
        "status": "verified",
        "message": "OTP verified! Set new password."
    }


# ===== FORGOT PASSWORD — Step 3: Set New Password =====
@router.post("/reset-password")
def reset_password(
    data: dict,
    db: Session = Depends(get_db)
):
    token = data.get("reset_token", "")
    new_password = data.get("new_password", "")
    confirm = data.get("confirm_password", "")

    key = f"token_{token}"
    if key not in otp_store:
        raise HTTPException(
            status_code=400,
            detail="Session expired! Start again."
        )

    stored = otp_store[key]

    if datetime.datetime.utcnow() > stored["expires"]:
        del otp_store[key]
        raise HTTPException(
            status_code=400,
            detail="Session expired!"
        )

    if new_password != confirm:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match!"
        )

    if len(new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Minimum 6 characters!"
        )

    user = db.query(models.User).filter(
        models.User.id == stored["user_id"]
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found!"
        )

    user.password_hash = hash_password(new_password)
    db.commit()
    del otp_store[key]

    return {
        "message": "Password reset successful! Login now.",
        "status": "success"
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
            raise HTTPException(
                status_code=401,
                detail="User not found!"
            )
        return {
            "token": create_access_token(
                user.id, user.role
            ),
            "refresh_token": create_refresh_token(
                user.id
            ),
            "name": user.name,
            "role": user.role
        }
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid token!"
        )


@router.get("/profile")
def get_profile():
    return {"message": "OK"}