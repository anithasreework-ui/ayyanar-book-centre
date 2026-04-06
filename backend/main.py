from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth, products, chatbot, recommend, admin, orders

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

@app.get("/")
def home():
    return {
        "message": "Ayyanar Book Centre API Running!",
        "version": "1.0.0"
    }