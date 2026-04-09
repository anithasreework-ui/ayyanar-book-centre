from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/wholesale", tags=["Wholesale"])

SHOP_INFO = {
    "name": "Ayyanar Book Centre",
    "address": "Dindigul, Tamil Nadu, India - 624 001",
    "phone": "+91 XXXXXXXXXX",
    "customer_care": "+91 XXXXXXXXXX",
    "email": "ayyanarbookcentre@gmail.com",
    "instagram": "@ayyanarbookcentre",
    "mou_available": True,
    "note": "MOU agreements available for schools and colleges"
}

@router.get("/info")
def get_wholesale_info():
    return SHOP_INFO

@router.post("/enquiry")
def submit_enquiry(data: dict, db: Session = Depends(get_db)):
    enquiry = models.WholesaleEnquiry(
        store_name=data.get("store_name", ""),
        name=data.get("name", ""),
        phone=data.get("phone", ""),
        message=data.get("message", "")
    )
    db.add(enquiry)
    db.commit()
    return {"message": "Enquiry submitted! We will contact you soon."}