from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from database import engine
import models
from collections import defaultdict
import time
from routers import (auth, products, chatbot, recommend,
                     admin, orders, wholesale, excel_upload,settings,payment)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ayyanar Book Centre API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting and security headers
request_counts = defaultdict(list)

@app.middleware("http")
async def security_middleware(request: Request, call_next):
    client_ip = request.client.host
    now = time.time()

    request_counts[client_ip] = [
        t for t in request_counts[client_ip]
        if now - t < 60
    ]

    if len(request_counts[client_ip]) > 100:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests!"}
        )

    request_counts[client_ip].append(now)

    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(chatbot.router)
app.include_router(recommend.router)
app.include_router(admin.router)
app.include_router(orders.router)
app.include_router(wholesale.router)
app.include_router(excel_upload.router)
app.include_router(settings.router)
app.include_router(payment.router)

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