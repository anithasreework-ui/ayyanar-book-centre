from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Text, Boolean
from sqlalchemy import DateTime
from database import get_db, Base
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
import datetime, os

router = APIRouter(
    prefix="/advertisements",
    tags=["Advertisements"]
)

SECRET_KEY = os.getenv("SECRET_KEY", "ayyanar2024secretkey")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/send-otp")


class Advertisement(Base):
    __tablename__ = "advertisements"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    content = Column(Text)
    type = Column(String(20), default="text")
    media_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(
        DateTime, default=datetime.datetime.utcnow
    )


def get_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=["HS256"]
        )
        if payload.get("role") != "admin":
            raise HTTPException(
                status_code=403,
                detail="Admin only!"
            )
        return payload
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid token!"
        )


# Public — All active ads
@router.get("/public")
def get_public_ads(db: Session = Depends(get_db)):
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


# Admin — All ads
@router.get("/admin/all")
def get_all_ads(
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
):
    ads = db.query(Advertisement).order_by(
        Advertisement.sort_order
    ).all()
    return ads


# Admin — Create ad
@router.post("/admin/create")
def create_ad(
    data: dict,
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
):
    ad = Advertisement(
        title=data.get("title", ""),
        content=data.get("content", ""),
        type=data.get("type", "text"),
        media_url=data.get("media_url"),
        is_active=data.get("is_active", True),
        sort_order=data.get("sort_order", 0)
    )
    db.add(ad)
    db.commit()
    db.refresh(ad)
    return {"message": "Ad created!", "id": ad.id}


# Admin — Update ad
@router.put("/admin/update/{ad_id}")
def update_ad(
    ad_id: int,
    data: dict,
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
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
        setattr(ad, key, value)
    db.commit()
    return {"message": "Ad updated!"}


# Admin — Delete ad
@router.delete("/admin/delete/{ad_id}")
def delete_ad(
    ad_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin)
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