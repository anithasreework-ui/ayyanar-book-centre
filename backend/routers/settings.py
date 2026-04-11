from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import Session
from database import get_db, Base
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
import datetime, os

router = APIRouter(prefix="/settings", tags=["Settings"])
SECRET_KEY = os.getenv("SECRET_KEY", "ayyanar2024secretkey")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class ShopSettings(Base):
    __tablename__ = "shop_settings"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=False)
    label = Column(String(200))
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)


def get_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        role = payload.get("role")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token!")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only!")
    return True


# Public — எல்லாரும் பார்க்கலாம்
@router.get("/public")
def get_public_settings(db: Session = Depends(get_db)):
    settings = db.query(ShopSettings).all()
    result = {}
    for s in settings:
        result[s.key] = s.value
    return result


# Admin — எல்லா settings பாரு
@router.get("/all")
def get_all_settings(
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
):
    settings = db.query(ShopSettings).all()
    return [
        {
            "id": s.id,
            "key": s.key,
            "value": s.value,
            "label": s.label,
            "updated_at": str(s.updated_at)
        }
        for s in settings
    ]


# Admin — Update பண்ணு
@router.put("/update")
def update_setting(
    data: dict,
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
):
    key = data.get("key")
    value = data.get("value", "")

    setting = db.query(ShopSettings).filter(
        ShopSettings.key == key
    ).first()

    if setting:
        setting.value = value
        setting.updated_at = datetime.datetime.utcnow()
    else:
        setting = ShopSettings(key=key, value=value, label=key)
        db.add(setting)

    db.commit()
    return {"message": f"Setting '{key}' updated!", "value": value}


# Admin — Bulk update
@router.put("/bulk-update")
def bulk_update(
    data: dict,
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
):
    updates = data.get("settings", {})
    for key, value in updates.items():
        setting = db.query(ShopSettings).filter(
            ShopSettings.key == key
        ).first()
        if setting:
            setting.value = str(value)
            setting.updated_at = datetime.datetime.utcnow()

    db.commit()
    return {"message": f"{len(updates)} settings updated!"}