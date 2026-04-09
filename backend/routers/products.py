from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/")
def get_all_products(category: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Product).filter(models.Product.is_available == True)
    if category:
        query = query.filter(models.Product.category == category)
    return query.all()

# ⚠️ /search MUST come before /{product_id}
@router.get("/search")
def search_products(keyword: str, db: Session = Depends(get_db)):
    products = db.query(models.Product).filter(
        models.Product.name.contains(keyword)
    ).all()
    return products

@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found!")
    return product