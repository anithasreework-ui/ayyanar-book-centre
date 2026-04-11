from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import (auth, products, chatbot, recommend,
                     admin, orders, wholesale, excel_upload,settings)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ayyanar Book Centre API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(chatbot.router)
app.include_router(recommend.router)
app.include_router(admin.router)
app.include_router(orders.router)
app.include_router(wholesale.router)
app.include_router(excel_upload.router)
app.include_router(settings.router)

@app.get("/")
def home():
    return {"message": "Ayyanar Book Centre API Running! 🚀"}
@app.get("/ping")
def ping():
    return {"status": "alive", "shop": "Ayyanar Book Centre"}
@app.get("/ping")
def ping():
    return {
        "status": "alive",
        "shop": "Ayyanar Book Centre",
        "location": "Dindigul, Tamil Nadu"
    }