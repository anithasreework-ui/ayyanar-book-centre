from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/products", tags=["Products"])


# ---- எல்லா Products காட்டு ----
@router.get("/")
def get_all_products(
    category: str = None,   # Filter by category
    db: Session = Depends(get_db)
):
    query = db.query(models.Product).filter(
        models.Product.is_available == True
    )
    
    # Category filter இருந்தா
    if category:
        query = query.filter(models.Product.category == category)
    
    products = query.all()
    return products


# ---- Single Product காட்டு ----
@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found!")
    
    return product


# ---- Search Products ----
@router.get("/search/{keyword}")
def search_products(keyword: str, db: Session = Depends(get_db)):
    products = db.query(models.Product).filter(
        models.Product.name.contains(keyword)
    ).all()
    
    return products