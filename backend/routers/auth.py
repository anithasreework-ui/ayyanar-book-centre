from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from database import get_db
import models, schemas, os

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Password encrypt பண்ண
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "defaultsecret")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def create_token(user_id: int, role: str):
    # Token 7 days valid
    expire = datetime.utcnow() + timedelta(days=7)
    data = {"sub": str(user_id), "role": role, "exp": expire}
    return jwt.encode(data, SECRET_KEY, algorithm="HS256")


# ---- REGISTER API ----
@router.post("/register")
def register(user: schemas.UserRegister, db: Session = Depends(get_db)):
    
    # Email already இருக்கா check பண்ணு
    existing = db.query(models.User).filter(
        models.User.email == user.email
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered!")
    
    # Password hash பண்ணு (plain text store பண்ண வேண்டாம்)
    hashed = hash_password(user.password)
    
    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed,
        phone=user.phone
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Registration successful!", "user_id": new_user.id}


# ---- LOGIN API ----
@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    
    db_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()
    
    # User இல்லன்னா or password wrong-ஆ
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Wrong email or password!")
    
    token = create_token(db_user.id, db_user.role)
    
    return {
        "token": token,
        "name": db_user.name,
        "role": db_user.role,
        "message": "Login successful!"
    }