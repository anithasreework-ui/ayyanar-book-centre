from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
import models, schemas, os

router = APIRouter(prefix="/admin", tags=["Admin"])
SECRET_KEY = os.getenv("SECRET_KEY", "ayyanar2024secretkey")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


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
        raise HTTPException(status_code=403, detail="Admin access only!")

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found!")
    return user


@router.get("/orders")
def get_all_orders(
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    orders = db.query(models.Order).all()
    result = []
    for o in orders:
        result.append({
            "id": o.id,
            "user_id": o.user_id,
            "total_amount": o.total_amount,
            "status": o.status,
            "delivery_type": o.delivery_type,
            "delivery_address": o.delivery_address,
            "phone": o.phone,
            "tracking_id": o.tracking_id,
            "otp_code": o.otp_code,
            "created_at": str(o.created_at)
        })
    return result


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
        subcategory=product.subcategory,
        stock_qty=product.stock_qty,
        image_url=product.image_url
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return {"message": "Product added!", "product_id": new_product.id}


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

    for key, value in data.items():
        if hasattr(product, key):
            setattr(product, key, value)
    db.commit()
    return {"message": f"Product #{product_id} updated!"}


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


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    total_products = db.query(models.Product).count()
    total_orders = db.query(models.Order).count()
    total_users = db.query(models.User).count()
    payments = db.query(models.Payment).filter(
        models.Payment.status == 'success'
    ).all()
    total_revenue = sum(p.amount for p in payments)
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
@router.get("/wholesale-enquiries")
def get_wholesale_enquiries(
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    enquiries = db.query(models.WholesaleEnquiry).order_by(
        models.WholesaleEnquiry.created_at.desc()
    ).all()
    result = []
    for e in enquiries:
        result.append({
            "id": e.id,
            "store_name": e.store_name,
            "name": e.name,
            "phone": e.phone,
            "message": e.message,
            "created_at": str(e.created_at)
        })
    return result