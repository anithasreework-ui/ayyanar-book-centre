from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
import models, os, random, string

router = APIRouter(prefix="/orders", tags=["Orders"])
SECRET_KEY = os.getenv("SECRET_KEY", "ayyanar2024secretkey")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token!")

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found!")
    return user


def generate_otp():
    return "SP-" + "".join(random.choices(string.digits, k=4))


def generate_tracking_id():
    return "OL-" + "".join(random.choices(string.digits, k=4))


def get_delivery_charge(
    subtotal: float,
    country: str,
    weight_kg: float = 0.5
) -> float:
    # Store pickup — always free
    if country == "PICKUP":
        return 0.0

    # International orders
    if country != "India":
        if weight_kg <= 1:
            return 800.0
        else:
            extra = weight_kg - 1
            return 800.0 + (extra * 400.0)

    # India — Weight based
    if weight_kg <= 1:
        return 0.0  # FREE under 1kg

    elif weight_kg <= 2:
        return 80.0

    elif weight_kg <= 5:
        return 150.0

    else:
        return 200.0


@router.post("/")
def place_order(
    order_data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        items = order_data.get("items", [])
        delivery_type = order_data.get("delivery_type", "home_delivery")
        delivery_address = order_data.get("delivery_address", "")
        phone = order_data.get("phone", "")
        alt_phone = order_data.get("alt_phone", "")
        pincode = order_data.get("pincode", "")
        country = order_data.get("country", "India")
        country_code = order_data.get("country_code", "+91")
        email = order_data.get("email", "")

        # Basic validation
        if not items:
            raise HTTPException(
                status_code=400,
                detail="Cart is empty!"
            )

        if not phone:
            raise HTTPException(
                status_code=400,
                detail="Phone number is required!"
            )

        if delivery_type == "home_delivery":
            if not delivery_address:
                raise HTTPException(
                    status_code=400,
                    detail="Delivery address is required!"
                )
            if not pincode:
                raise HTTPException(
                    status_code=400,
                    detail="Pincode is required!"
                )

        # Calculate subtotal + weight
        subtotal = 0.0
        total_weight = 0.0
        valid_items = []

        for item in items:
            product = db.query(models.Product).filter(
                models.Product.id == item.get("id"),
                models.Product.is_available == True
            ).first()

            if product:
                qty = int(item.get("quantity", 1))
                subtotal += product.price * qty

                # Weight per product (default 0.3kg)
                product_weight = getattr(
                    product, 'weight_kg', 0.3
                ) or 0.3
                total_weight += product_weight * qty

                valid_items.append({
                    "product": product,
                    "quantity": qty,
                    "price": product.price
                })

        if not valid_items:
            raise HTTPException(
                status_code=400,
                detail="No valid products in cart!"
            )

        # Calculate delivery charge
        delivery_charge = 0.0
        if delivery_type == "home_delivery":
            delivery_charge = get_delivery_charge(
                subtotal, country, total_weight
            )

        total = subtotal + delivery_charge

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
            delivery_address=delivery_address
                if delivery_type == "home_delivery"
                else "Store Pickup - Ayyanar Book Centre, Dindigul",
            phone=phone,
            alt_phone=alt_phone,
            pincode=pincode,
            country=country,
            country_code=country_code,
            email=email or current_user.email,
            otp_code=otp_code,
            tracking_id=tracking_id
        )
        db.add(new_order)
        db.flush()

        # Save order items + reduce stock
        for vi in valid_items:
            order_item = models.OrderItem(
                order_id=new_order.id,
                product_id=vi["product"].id,
                quantity=vi["quantity"],
                price=vi["price"]
            )
            db.add(order_item)

            # Reduce stock
            vi["product"].stock_qty = max(
                0,
                vi["product"].stock_qty - vi["quantity"]
            )

        db.commit()
        db.refresh(new_order)

        return {
            "message": "Order placed successfully!",
            "order_id": new_order.id,
            "subtotal": round(subtotal, 2),
            "total_weight_kg": round(total_weight, 2),
            "delivery_charge": round(delivery_charge, 2),
            "total": round(total, 2),
            "delivery_type": delivery_type,
            "otp_code": otp_code,
            "tracking_id": tracking_id,
            "status": "success"
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Order failed: {str(e)}"
        )


@router.get("/my-orders")
def get_my_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    orders = db.query(models.Order).filter(
        models.Order.user_id == current_user.id
    ).order_by(models.Order.created_at.desc()).all()

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


@router.get("/track/{track_code}")
def track_order(track_code: str, db: Session = Depends(get_db)):

    # Online tracking ID (OL-XXXX)
    order = db.query(models.Order).filter(
        models.Order.tracking_id == track_code.upper()
    ).first()

    # Store pickup OTP (SP-XXXX)
    if not order:
        order = db.query(models.Order).filter(
            models.Order.otp_code == track_code.upper()
        ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Tracking ID or OTP not found! Please check again."
        )

    return {
        "tracking_id": order.tracking_id,
        "otp_code": order.otp_code,
        "order_id": order.id,
        "status": order.status,
        "delivery_type": order.delivery_type,
        "delivery_address": order.delivery_address,
        "total_amount": order.total_amount,
        "phone": order.phone,
        "created_at": str(order.created_at)
    }