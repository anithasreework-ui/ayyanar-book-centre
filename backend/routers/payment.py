from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
import models, os, razorpay, json, hmac, hashlib

router = APIRouter(prefix="/payment", tags=["Payment"])
SECRET_KEY = os.getenv("SECRET_KEY", "ayyanar2024secretkey")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

# Razorpay client helper
def get_razorpay_client():
    key = os.getenv("RAZORPAY_KEY_ID", "")
    secret = os.getenv("RAZORPAY_KEY_SECRET", "")
    return razorpay.Client(auth=(key, secret))


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


# Step 1: Razorpay Order Create பண்ணு
@router.post("/create-order")
def create_razorpay_order(
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    amount = data.get("amount", 0)
    order_id = data.get("order_id")

    if not amount or amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid amount!"
        )

    try:
        # இப்போ create பண்றோம்
        rzp = get_razorpay_client()
        
        rzp_order = rzp.order.create({
            "amount": int(float(amount) * 100),
            "currency": "INR",
            "receipt": f"order_{order_id}",
            "notes": {
                "shop_order_id": str(order_id),
                "customer": current_user.name
            }
        })

        key_id = os.getenv("RAZORPAY_KEY_ID", "")
        
        return {
            "razorpay_order_id": rzp_order["id"],
            "amount": amount,
            "currency": "INR",
            "key_id": key_id
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Payment creation failed: {str(e)}"
        )


# Step 2: Payment Verify பண்ணு
@router.post("/verify")
def verify_payment(
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_signature = data.get("razorpay_signature")
    shop_order_id = data.get("shop_order_id")
    payment_method = data.get("payment_method", "upi")

    # Signature verify பண்ணு — security check
    try:
        msg = f"{razorpay_order_id}|{razorpay_payment_id}"
        generated_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode(),
            msg.encode(),
            hashlib.sha256
        ).hexdigest()

        if generated_signature != razorpay_signature:
            # Payment tampered!
            raise HTTPException(
                status_code=400,
                detail="Payment verification failed! Invalid signature."
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Signature verification error!"
        )

    # Payment record save பண்ணு
    order = db.query(models.Order).filter(
        models.Order.id == shop_order_id
    ).first()

    if order:
        order.status = "confirmed"

    new_payment = models.Payment(
        order_id=shop_order_id,
        amount=data.get("amount", 0),
        payment_method=payment_method,
        status="success",
        transaction_id=razorpay_payment_id
    )
    db.add(new_payment)
    db.commit()

    return {
        "message": "Payment successful! Order confirmed.",
        "payment_id": razorpay_payment_id,
        "order_id": shop_order_id,
        "status": "success"
    }


# COD Order Confirm
@router.post("/cod-confirm")
def cod_confirm(
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    shop_order_id = data.get("order_id")
    delivery_otp = data.get("delivery_otp")

    order = db.query(models.Order).filter(
        models.Order.id == shop_order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found!"
        )

    # OTP verify பண்ணு
    if order.otp_code and order.otp_code != delivery_otp:
        raise HTTPException(
            status_code=400,
            detail="Wrong OTP! Payment not confirmed."
        )

    # COD payment record
    new_payment = models.Payment(
        order_id=shop_order_id,
        amount=order.total_amount,
        payment_method="cash_on_delivery",
        status="success",
        transaction_id=f"COD-{shop_order_id}"
    )
    db.add(new_payment)
    order.status = "delivered"
    db.commit()

    return {
        "message": "COD Payment confirmed! Order delivered.",
        "status": "success"
    }


# Admin — Payment history
@router.get("/admin/all")
def get_all_payments(db: Session = Depends(get_db)):
    payments = db.query(models.Payment).order_by(
        models.Payment.created_at.desc()
    ).all()
    result = []
    for p in payments:
        result.append({
            "id": p.id,
            "order_id": p.order_id,
            "amount": p.amount,
            "payment_method": p.payment_method,
            "status": p.status,
            "transaction_id": p.transaction_id,
            "created_at": str(p.created_at)
        })
    return result
@router.post("/cod-pending")
def cod_pending(
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    shop_order_id = data.get("order_id")
    order = db.query(models.Order).filter(
        models.Order.id == shop_order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found!"
        )

    new_payment = models.Payment(
        order_id=shop_order_id,
        amount=order.total_amount,
        payment_method="cash_on_delivery",
        status="pending",
        transaction_id=f"COD-PENDING-{shop_order_id}"
    )
    db.add(new_payment)
    db.commit()

    return {
        "message": "COD order placed! Pay on delivery.",
        "status": "pending"
    }