from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import (
    Column, Integer, String, Text,
    Boolean, DateTime, create_engine
)
from sqlalchemy.orm import Session
from database import get_db, Base
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
import datetime, os

router = APIRouter(
    prefix="/advertisements",
    tags=["Advertisements"]
)

SECRET_KEY = os.getenv("SECRET_KEY", "ayyanar2024secretkey")
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    auto_error=False
)


class Advertisement(Base):
    __tablename__ = "advertisements"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=True)
    content = Column(Text, nullable=True)
    type = Column(String(20), default="text")
    media_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )


def get_admin_user(
    token: str = Depends(oauth2_scheme)
):
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated!"
        )
    try:
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=["HS256"]
        )
        if payload.get("role") != "admin":
            raise HTTPException(
                status_code=403,
                detail="Admin access only!"
            )
        return payload
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid token!"
        )


# ===== PUBLIC — Active ads =====
@router.get("/public")
def get_public_ads(db: Session = Depends(get_db)):
    try:
        ads = db.query(Advertisement).filter(
            Advertisement.is_active == True
        ).order_by(Advertisement.sort_order).all()
        return [
            {
                "id": a.id,
                "title": a.title,
                "content": a.content,
                "type": a.type,
                "media_url": a.media_url,
            }
            for a in ads
        ]
    except Exception as e:
        print(f"Ads error: {e}")
        return []


# ===== ADMIN — Get all ads =====
@router.get("/admin/all")
def get_all_ads(
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    ads = db.query(Advertisement).order_by(
        Advertisement.sort_order
    ).all()
    return [
        {
            "id": a.id,
            "title": a.title,
            "content": a.content,
            "type": a.type,
            "media_url": a.media_url,
            "is_active": a.is_active,
            "sort_order": a.sort_order,
            "created_at": str(a.created_at),
        }
        for a in ads
    ]


# ===== ADMIN — Create ad =====
@router.post("/admin/create")
def create_ad(
    data: dict,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    if not data.get("content"):
        raise HTTPException(
            status_code=400,
            detail="Content is required!"
        )

    ad = Advertisement(
        title=data.get("title", ""),
        content=data.get("content", ""),
        type=data.get("type", "text"),
        media_url=data.get("media_url") or None,
        is_active=data.get("is_active", True),
        sort_order=data.get("sort_order", 0),
    )
    db.add(ad)
    db.commit()
    db.refresh(ad)
    return {
        "message": "Ad created successfully!",
        "id": ad.id
    }


# ===== ADMIN — Update ad =====
@router.put("/admin/update/{ad_id}")
def update_ad(
    ad_id: int,
    data: dict,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    ad = db.query(Advertisement).filter(
        Advertisement.id == ad_id
    ).first()
    if not ad:
        raise HTTPException(
            status_code=404,
            detail="Ad not found!"
        )
    for key, value in data.items():
        if hasattr(ad, key):
            setattr(ad, key, value)
    db.commit()
    return {"message": "Ad updated!"}


# ===== ADMIN — Delete ad =====
@router.delete("/admin/delete/{ad_id}")
def delete_ad(
    ad_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    ad = db.query(Advertisement).filter(
        Advertisement.id == ad_id
    ).first()
    if not ad:
        raise HTTPException(
            status_code=404,
            detail="Ad not found!"
        )
    db.delete(ad)
    db.commit()
    return {"message": "Ad deleted!"}