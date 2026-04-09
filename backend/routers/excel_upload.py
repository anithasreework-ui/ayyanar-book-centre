from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
import models, os, io
import pandas as pd

router = APIRouter(prefix="/admin/excel", tags=["Excel Upload"])

SECRET_KEY = os.getenv("SECRET_KEY", "ayyanar2024secretkey")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_admin_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = int(payload.get("sub"))
        role = payload.get("role")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token!")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only!")
    return db.query(models.User).filter(models.User.id == user_id).first()

@router.post("/upload")
async def upload_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only Excel files allowed!")

    contents = await file.read()
    df = pd.read_excel(io.BytesIO(contents))

    required = ['name', 'category', 'price', 'stock_qty']
    for col in required:
        if col not in df.columns:
            raise HTTPException(status_code=400, detail=f"Column '{col}' missing!")

    added, errors = 0, []
    for index, row in df.iterrows():
        try:
            product = models.Product(
                name=str(row['name']),
                category=str(row['category']),
                price=float(row['price']),
                stock_qty=int(row['stock_qty']),
                description=str(row.get('description', '')),
                image_url=str(row.get('image_url', '')),
                subcategory=str(row.get('subcategory', ''))
            )
            db.add(product)
            added += 1
        except Exception as e:
            errors.append(f"Row {index + 2}: {str(e)}")
    db.commit()
    return {"message": f"{added} products added!", "errors": errors}