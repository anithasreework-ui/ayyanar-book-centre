from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import datetime, timedelta
from database import get_db
from utils.email_sender import send_password_reset_email
import models, os, bcrypt

router = APIRouter(prefix="/auth", tags=["Authentication"])
SECRET_KEY = os.getenv("SECRET_KEY", "ayyanar2024secretkey")
REFRESH_SECRET = os.getenv(
    "REFRESH_SECRET", "ayyanar2024refreshsecret"
)


def hash_password(password: str) -> str:
    pwd_bytes = password[:72].encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain[:72].encode('utf-8'),
            hashed.encode('utf-8')
        )
    except Exception:
        return False


def create_access_token(user_id: int, role: str) -> str:
    # Access token — 7 days
    expire = datetime.utcnow() + timedelta(days=7)
    data = {
        "sub": str(user_id),
        "role": role,
        "exp": expire,
        "type": "access"
    }
    return jwt.encode(data, SECRET_KEY, algorithm="HS256")


def create_refresh_token(user_id: int) -> str:
    # Refresh token — 30 days
    expire = datetime.utcnow() + timedelta(days=30)
    data = {
        "sub": str(user_id),
        "exp": expire,
        "type": "refresh"
    }
    return jwt.encode(data, REFRESH_SECRET, algorithm="HS256")


@router.post("/register")
def register(user: dict, db: Session = Depends(get_db)):
    name = user.get("name", "").strip()
    email = user.get("email", "").strip().lower()
    password = user.get("password", "")
    phone = user.get("phone", "")

    if not name or not email or not password:
        raise HTTPException(
            status_code=400,
            detail="Name, email and password required!"
        )
    if len(password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters!"
        )

    existing = db.query(models.User).filter(
        models.User.email == email
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered!"
        )

    new_user = models.User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        phone=phone,
        role="customer"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(new_user.id, new_user.role)
    refresh_token = create_refresh_token(new_user.id)

    return {
        "message": "Registration successful!",
        "token": access_token,
        "refresh_token": refresh_token,
        "name": new_user.name,
        "role": new_user.role,
        "expires_in": 604800  # 7 days in seconds
    }


@router.post("/login")
def login(user: dict, db: Session = Depends(get_db)):
    email = user.get("email", "").strip().lower()
    password = user.get("password", "")

    if not email or not password:
        raise HTTPException(
            status_code=400,
            detail="Email and password required!"
        )

    db_user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if not db_user or not verify_password(
        password, db_user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Wrong email or password!"
        )

    access_token = create_access_token(db_user.id, db_user.role)
    refresh_token = create_refresh_token(db_user.id)

    return {
        "token": access_token,
        "refresh_token": refresh_token,
        "name": db_user.name,
        "role": db_user.role,
        "message": "Login successful!",
        "expires_in": 604800
    }


@router.post("/refresh")
def refresh_token(data: dict, db: Session = Depends(get_db)):
    """Auto-renew access token using refresh token"""
    token = data.get("refresh_token", "")

    if not token:
        raise HTTPException(
            status_code=400,
            detail="Refresh token required!"
        )

    try:
        payload = jwt.decode(
            token, REFRESH_SECRET, algorithms=["HS256"]
        )
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=401,
                detail="Invalid token type!"
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

        # New tokens generate பண்ணு
        new_access = create_access_token(user.id, user.role)
        new_refresh = create_refresh_token(user.id)

        return {
            "token": new_access,
            "refresh_token": new_refresh,
            "name": user.name,
            "role": user.role,
            "expires_in": 604800
        }

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token expired. Please login again."
        )


@router.post("/forgot-password")
def forgot_password(data: dict, db: Session = Depends(get_db)):
    email = data.get("email", "").strip().lower()
    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email is required!"
        )

    user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    # Security — always return success
    if not user:
        return {
            "message": "If this email is registered, "
                       "you will receive reset instructions.",
            "status": "sent"
        }

    # Generate temp password
    import random, string
    temp_password = "Temp@" + "".join(
        random.choices(string.digits + string.ascii_uppercase, k=6)
    )

    # Update DB
    user.password_hash = hash_password(temp_password)
    db.commit()

    # Send email
    email_sent = send_password_reset_email(
        to_email=email,
        name=user.name,
        temp_password=temp_password
    )

    if email_sent:
        return {
            "message": "Password reset email sent! "
                       "Check your inbox.",
            "status": "email_sent"
        }
    else:
        # Email fail ஆனா — website-ல காட்டு (fallback)
        return {
            "message": "Email sending failed. "
                       "Here is your temporary password:",
            "temp_password": temp_password,
            "status": "fallback"
        }

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=["HS256"]
        )
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=401, detail="Invalid token!"
        )
    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()
    if not user:
        raise HTTPException(
            status_code=404, detail="User not found!"
        )
    return user


@router.get("/profile")
def get_profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": getattr(current_user, 'phone', '') or '',
        "address": getattr(current_user, 'address', '') or '',
        "pincode": getattr(current_user, 'pincode', '') or '',
        "city": getattr(current_user, 'city', '') or '',
        "role": current_user.role,
    }


@router.put("/profile")
def update_profile(
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if data.get("name"):
        current_user.name = data["name"]
    if "phone" in data:
        current_user.phone = data["phone"]
    if "address" in data:
        current_user.address = data["address"]
    if "pincode" in data:
        current_user.pincode = data["pincode"]
    if "city" in data:
        current_user.city = data["city"]
    db.commit()

    # Update localStorage user info
    return {
        "message": "Profile updated!",
        "name": current_user.name,
        "phone": current_user.phone,
    }


@router.post("/change-password")
def change_password(
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    current_pwd = data.get("current_password", "")
    new_pwd = data.get("new_password", "")

    if not current_pwd or not new_pwd:
        raise HTTPException(
            status_code=400,
            detail="Both passwords required!"
        )
    if len(new_pwd) < 6:
        raise HTTPException(
            status_code=400,
            detail="Minimum 6 characters!"
        )
    if not verify_password(current_pwd,
                           current_user.password_hash):
        raise HTTPException(
            status_code=400,
            detail="Current password is wrong!"
        )

    current_user.password_hash = hash_password(new_pwd)
    db.commit()
    return {"message": "Password changed successfully!"}
