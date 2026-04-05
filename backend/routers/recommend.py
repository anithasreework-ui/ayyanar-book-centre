from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/ai", tags=["AI Recommendations"])

@router.get("/recommend/{product_id}")
def get_recommendations(product_id: int, db: Session = Depends(get_db)):
    
    # இந்த product எந்த category?
    current_product = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()
    
    if not current_product:
        return {"recommendations": [], "message": "Product not found"}
    
    # Same category-ல மத்த products எடு
    similar_products = db.query(models.Product).filter(
        models.Product.category == current_product.category,
        models.Product.id != product_id,
        models.Product.is_available == True
    ).limit(5).all()
    
    result = []
    for p in similar_products:
        result.append({
            "id": p.id,
            "name": p.name,
            "price": p.price,
            "category": p.category
        })
    
    return {
        "based_on": current_product.name,
        "category": current_product.category,
        "recommendations": result
    }