from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt
from datetime import datetime, timedelta
from database import get_db
import models, os, bcrypt

router = APIRouter(prefix="/auth", tags=["Authentication"])
SECRET_KEY = os.getenv("SECRET_KEY", "ayyanar2024secretkey")


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


def create_token(user_id: int, role: str) -> str:
    expire = datetime.utcnow() + timedelta(days=7)
    data = {"sub": str(user_id), "role": role, "exp": expire}
    return jwt.encode(data, SECRET_KEY, algorithm="HS256")


@router.post("/register")
def register(user: dict, db: Session = Depends(get_db)):
    name = user.get("name", "").strip()
    email = user.get("email", "").strip().lower()
    password = user.get("password", "")
    phone = user.get("phone", "")

    if not name or not email or not password:
        raise HTTPException(
            status_code=400,
            detail="Name, email and password are required!"
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

    token = create_token(new_user.id, new_user.role)
    return {
        "message": "Registration successful!",
        "token": token,
        "name": new_user.name,
        "role": new_user.role
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

    if not db_user or not verify_password(password, db_user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Wrong email or password!"
        )

    token = create_token(db_user.id, db_user.role)
    return {
        "token": token,
        "name": db_user.name,
        "role": db_user.role,
        "message": "Login successful!"
    }