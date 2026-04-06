from pydantic import BaseModel
from typing import Optional

# ---- USER SCHEMAS ----

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True

# ---- PRODUCT SCHEMAS ----

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: str
    stock_qty: int
    image_url: Optional[str] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    category: str
    stock_qty: int
    is_available: bool

    class Config:
        from_attributes = True

# ---- ORDER SCHEMAS ----

class OrderCreate(BaseModel):
    delivery_type: str
    delivery_address: Optional[str] = None
    items: list

class OrderResponse(BaseModel):
    id: int
    total_amount: float
    status: str
    delivery_type: str

    class Config:
        from_attributes = True