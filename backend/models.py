from sqlalchemy import (Column, Integer, String, Float, 
                        Boolean, Text, DateTime, ForeignKey)
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(15))
    role = Column(String(20), default='customer')
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    orders = relationship("Order", back_populates="user")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String(100))
    subcategory = Column(String(100))
    stock_qty = Column(Integer, default=0)
    image_url = Column(String(500))
    weight_kg = Column(Float, default=0.5)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_amount = Column(Float)
    status = Column(String(50), default='pending')
    delivery_type = Column(String(50), default='home_delivery')
    delivery_address = Column(Text)
    phone = Column(String(15))
    alt_phone = Column(String(15))
    pincode = Column(String(10))
    country = Column(String(100), default='India')
    country_code = Column(String(10), default='+91')
    email = Column(String(100))
    tracking_id = Column(String(20))
    otp_code = Column(String(20))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    price = Column(Float)
    order = relationship("Order", back_populates="items")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    amount = Column(Float)
    payment_method = Column(String(50))
    status = Column(String(20), default='pending')
    transaction_id = Column(String(255))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WholesaleEnquiry(Base):
    __tablename__ = "wholesale_enquiries"
    id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String(255))
    name = Column(String(100), nullable=False)
    phone = Column(String(15), nullable=False)
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)