from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
import models, schemas, os

router = APIRouter(prefix="/admin", tags=["Admin"])

SECRET_KEY = os.getenv("SECRET_KEY", "ayyanar2024secretkey")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Admin-ஆ check பண்ற function
def get_admin_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = int(payload.get("sub"))
        role = payload.get("role")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token!")

    if role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access only!"
        )

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found!")

    return user


# ---- எல்லா Orders பாரு ----
@router.get("/orders")
def get_all_orders(
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    orders = db.query(models.Order).all()
    result = []
    for order in orders:
        result.append({
            "id": order.id,
            "user_id": order.user_id,
            "total_amount": order.total_amount,
            "status": order.status,
            "delivery_type": order.delivery_type,
            "delivery_address": order.delivery_address,
            "created_at": str(order.created_at)
        })
    return result


# ---- Order Status Update ----
@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status_data: dict,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    order = db.query(models.Order).filter(
        models.Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found!")

    order.status = status_data.get("status")
    db.commit()
    return {"message": f"Order #{order_id} updated!", "status": order.status}


# ---- Product Add பண்ணு (Admin only) ----
@router.post("/products")
def add_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    new_product = models.Product(
        name=product.name,
        description=product.description,
        price=product.price,
        category=product.category,
        stock_qty=product.stock_qty,
        image_url=product.image_url
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return {
        "message": "Product added!",
        "product_id": new_product.id
    }


# ---- Product Update (Stock etc) ----
@router.put("/products/{product_id}")
def update_product(
    product_id: int,
    data: dict,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    product = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found!")

    # Dynamic update — எந்த field வந்தாலும் update ஆகும்
    for key, value in data.items():
        if hasattr(product, key):
            setattr(product, key, value)

    db.commit()
    return {"message": f"Product #{product_id} updated!"}


# ---- Product Delete ----
@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    product = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found!")

    db.delete(product)
    db.commit()
    return {"message": f"Product #{product_id} deleted!"}


# ---- Dashboard Stats ----
@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    total_products = db.query(models.Product).count()
    total_orders = db.query(models.Order).count()
    total_users = db.query(models.User).count()

    # Total revenue
    payments = db.query(models.Payment).filter(
        models.Payment.status == 'success'
    ).all()
    total_revenue = sum(p.amount for p in payments)

    # Pending orders
    pending = db.query(models.Order).filter(
        models.Order.status == 'pending'
    ).count()

    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_users": total_users,
        "total_revenue": total_revenue,
        "pending_orders": pending
    }