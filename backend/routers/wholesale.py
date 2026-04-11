from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/wholesale", tags=["Wholesale"])

SHOP_INFO = {
    "name": "Ayyanar Book Centre",
    "address": "Dindigul, Tamil Nadu, India - 624 001",
    "phone": "+91 9894235330",
    "customer_care": "+91 9894235330",
    "email": "ayyanarbookcentredgl1@gmail.com",
    "instagram": "@ayyanarbookcentre",
    "mou_available": True,
    "note": "MOU agreements available for schools and colleges",
    "working_hours": "Monday to Saturday, 9:00 AM to 9:00 PM"
}


@router.get("/info")
def get_wholesale_info():
    return SHOP_INFO


@router.post("/enquiry")
def submit_enquiry(data: dict, db: Session = Depends(get_db)):
    # Validate
    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()

    if not name or not phone:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail="Name and phone are required!"
        )

    try:
        enquiry = models.WholesaleEnquiry(
            store_name=data.get("store_name", ""),
            name=name,
            phone=phone,
            message=data.get("message", "")
        )
        db.add(enquiry)
        db.commit()
        return {
            "message": "Enquiry submitted successfully!",
            "status": "success"
        }
    except Exception as e:
        db.rollback()
        from fastapi import HTTPException
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save enquiry: {str(e)}"
        )