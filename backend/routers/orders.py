from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
import models, os

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


# ---- Order Place பண்ணு ----
@router.post("/")
def place_order(
    order_data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    items = order_data.get("items", [])
    delivery_type = order_data.get("delivery_type", "home_delivery")
    delivery_address = order_data.get("delivery_address", "")

    if not items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty!"
        )

    # Total calculate பண்ணு
    total = 0
    for item in items:
        product = db.query(models.Product).filter(
            models.Product.id == item["id"]
        ).first()
        if product:
            total += product.price * item["quantity"]

    # Delivery charge
    if delivery_type == "home_delivery" and total < 500:
        total += 50

    # Order create பண்ணு
    new_order = models.Order(
        user_id=current_user.id,
        total_amount=total,
        status="pending",
        delivery_type=delivery_type,
        delivery_address=delivery_address
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Order Items save பண்ணு
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
            # Stock குறை பண்ணு
            product.stock_qty -= item["quantity"]

    db.commit()

    return {
        "message": "Order placed successfully!",
        "order_id": new_order.id,
        "total": total
    }


# ---- My Orders பாரு ----
@router.get("/my-orders")
def get_my_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
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
            "created_at": str(order.created_at)
        })
    return result