from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# .env file load பண்ணு
load_dotenv()

# MySQL connection string
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

# Engine create பண்ணு (MySQL-ஓட connection)
engine = create_engine(DATABASE_URL)

# Session — ஒவ்வொரு request-ku ஒரு connection
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Database session get பண்ற function
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()