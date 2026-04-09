from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
import models, os, random, string

router = APIRouter(prefix="/orders", tags=["Orders"])
SECRET_KEY = os.getenv("SECRET_KEY", "ayyanar2024secretkey")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token!")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found!")
    return user

def generate_otp():
    return "SP-" + "".join(random.choices(string.digits, k=4))

def generate_tracking_id():
    return "OL-" + "".join(random.choices(string.digits, k=4))

def calculate_delivery(total: float, country: str, weight: float = 0.5):
    if country != "India":
        return 500.0
    if total >= 1000:
        return 0.0
    # Check if Tamil Nadu - simplified
    return 50.0  # Default TN rate


@router.post("/")
def place_order(order_data: dict, db: Session = Depends(get_db),
                current_user=Depends(get_current_user)):
    items = order_data.get("items", [])
    delivery_type = order_data.get("delivery_type", "home_delivery")
    delivery_address = order_data.get("delivery_address", "")
    phone = order_data.get("phone", "")
    alt_phone = order_data.get("alt_phone", "")
    pincode = order_data.get("pincode", "")
    country = order_data.get("country", "India")
    country_code = order_data.get("country_code", "+91")
    email = order_data.get("email", "")

    if not items:
        raise HTTPException(status_code=400, detail="Cart is empty!")

    # Validate mandatory fields
    if delivery_type == "store_pickup" and not phone:
        raise HTTPException(
            status_code=400,
            detail="Phone number mandatory for store pickup!"
        )
    if delivery_type == "home_delivery":
        if not phone or not delivery_address or not pincode:
            raise HTTPException(
                status_code=400,
                detail="Address, pincode and phone are mandatory!"
            )

    # Calculate total
    total = 0
    for item in items:
        product = db.query(models.Product).filter(
            models.Product.id == item["id"]
        ).first()
        if product:
            total += product.price * item["quantity"]

    # Delivery charge
    delivery_charge = 0
    if delivery_type == "home_delivery":
        delivery_charge = calculate_delivery(total, country)
    total += delivery_charge

    # Generate OTP or Tracking ID
    otp_code = None
    tracking_id = None
    if delivery_type == "store_pickup":
        otp_code = generate_otp()
    else:
        tracking_id = generate_tracking_id()

    # Create order
    new_order = models.Order(
        user_id=current_user.id,
        total_amount=total,
        status="pending",
        delivery_type=delivery_type,
        delivery_address=delivery_address,
        phone=phone,
        alt_phone=alt_phone,
        pincode=pincode,
        country=country,
        country_code=country_code,
        email=email,
        otp_code=otp_code,
        tracking_id=tracking_id
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Save order items + update stock
    for item in items:
        product = db.query(models.Product).filter(
            models.Product.id == item["id"]
        ).first()
        if product:
            order_item = models.OrderItem(
                order_id=new_order.id,
                product_id=item["id"],
                quantity=item["quantity"],
                price=product.price
            )
            db.add(order_item)
            product.stock_qty -= item["quantity"]
    db.commit()

    return {
        "message": "Order placed successfully!",
        "order_id": new_order.id,
        "total": total,
        "delivery_charge": delivery_charge,
        "otp_code": otp_code,
        "tracking_id": tracking_id,
        "delivery_type": delivery_type
    }


@router.get("/my-orders")
def get_my_orders(db: Session = Depends(get_db),
                  current_user=Depends(get_current_user)):
    orders = db.query(models.Order).filter(
        models.Order.user_id == current_user.id
    ).all()
    result = []
    for order in orders:
        result.append({
            "id": order.id,
            "total_amount": order.total_amount,
            "status": order.status,
            "delivery_type": order.delivery_type,
            "tracking_id": order.tracking_id,
            "otp_code": order.otp_code,
            "created_at": str(order.created_at)
        })
    return result


@router.get("/track/{tracking_id}")
def track_order(tracking_id: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(
        models.Order.tracking_id == tracking_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Tracking ID not found!")
    return {
        "tracking_id": tracking_id,
        "status": order.status,
        "delivery_type": order.delivery_type,
        "delivery_address": order.delivery_address,
        "created_at": str(order.created_at)
    }