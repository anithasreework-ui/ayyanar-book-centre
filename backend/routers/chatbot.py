from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
import os, traceback
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI Chatbot"])

MODEL = "llama-3.3-70b-versatile"

# Create the Groq client safely so a bad library version
# cannot crash the whole backend at startup
client = None
try:
    from groq import Groq
    if os.getenv("GROQ_API_KEY"):
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
except Exception as e:
    print(f"Groq init error: {e}")

LANG_RULES = {
    "english": "Reply in simple, friendly English.",
    "tamil": "தமிழிலேயே பதில் சொல்லுங்கள்.",
    "tanglish": "Reply in Tanglish (Tamil words written in English letters).",
}

# Words the customer may type -> category in our database
CATEGORY_HINTS = {
    "children": ["child", "children", "kid", "kids", "baby", "story", "kuzhandhai"],
    "novels": ["novel", "fiction"],
    "tnpsc": ["tnpsc", "group 1", "group 2", "group 4", "group1", "group2", "group4"],
    "state_board": ["state board", "samacheer", "samacheer kalvi", "guide"],
    "cbse": ["cbse"],
    "ncert": ["ncert", "neet"],
    "medical": ["medical", "mbbs", "nursing"],
    "stationery": ["pen", "pencil", "notebook", "stationery", "geometry"],
    "motivational": ["motivation", "motivational", "self help"],
    "gifts": ["gift", "hamper"],
    "central_competitive": ["upsc", "ssc", "bank", "railway", "competitive"],
}


def get_settings(db: Session) -> dict:
    try:
        rows = db.execute(text("SELECT key, value FROM shop_settings")).fetchall()
        return {r[0]: r[1] for r in rows}
    except Exception as e:
        db.rollback()
        print(f"Settings error: {e}")
        return {}


def get_catalog_info(db: Session, user_message: str) -> str:
    """Raw SQL so it never breaks when model columns change."""
    msg = user_message.lower()
    out = ""

    try:
        # 1. Summary of what we stock
        rows = db.execute(text(
            "SELECT category, COUNT(*) FROM products "
            "WHERE is_available = true GROUP BY category"
        )).fetchall()
        if rows:
            out += "=== CATEGORIES WE STOCK (number of titles) ===\n"
            for r in rows:
                out += f"- {r[0].replace('_', ' ')}: {r[1]}\n"

        # 2. Products matching the customer's question
        cats = [c for c, words in CATEGORY_HINTS.items()
                if any(w in msg for w in words)]
        keywords = [w for w in msg.replace("?", " ").replace(",", " ").split()
                    if len(w) >= 4][:5]

        conditions, params = [], {}
        if cats:
            conditions.append("category = ANY(:cats)")
            params["cats"] = cats
        for i, k in enumerate(keywords):
            conditions.append(f"LOWER(name) LIKE :k{i}")
            params[f"k{i}"] = f"%{k}%"

        if conditions:
            sql = (
                "SELECT name, price, category, stock_qty FROM products "
                "WHERE is_available = true AND (" + " OR ".join(conditions) + ") "
                "ORDER BY id DESC LIMIT 10"
            )
            found = db.execute(text(sql), params).fetchall()
            if found:
                out += "\n=== MATCHING BOOKS IN OUR DATABASE ===\n"
                for p in found:
                    stock = "In stock" if (p[3] or 0) > 0 else "Out of stock"
                    out += f"- {p[0]} | Rs.{p[1]} | {p[2]} | {stock}\n"
            else:
                out += "\n=== MATCHING BOOKS ===\nNONE FOUND in our database.\n"
    except Exception as e:
        db.rollback()
        print(f"Catalog error: {e}")
        out += "\n(Book list unavailable right now)\n"

    return out


def build_system_prompt(db: Session, user_message: str, language: str) -> str:
    s = get_settings(db)
    phone = s.get("customer_care") or s.get("phone") or "+91 9486208869"
    insta = s.get("instagram") or "@ayyanarbookcentre"
    address = s.get("shop_address") or "14, Dudley School Building, AMC Road, Dindigul, Tamil Nadu 624001"
    hours = s.get("working_hours") or "Monday to Saturday, 9:00 AM to 9:00 PM"
    email = s.get("email") or "ayyanarbookcentredgl1@gmail.com"

    branch2 = ""
    if (s.get("branch_2_name") or "").strip():
        branch2 = (f"\nBranch 2: {s.get('branch_2_name')}, "
                   f"{s.get('branch_2_address')}, {s.get('branch_2_phone')}")

    catalog = get_catalog_info(db, user_message)
    lang = LANG_RULES.get(language, LANG_RULES["english"])

    return f"""You are the friendly shopping assistant of Ayyanar Book Centre, Dindigul.

=== SHOP DETAILS ===
Name: {s.get('shop_name', 'Ayyanar Book Centre')} (serving since 1985)
Address: {address}
Phone / Customer care: {phone}
Email: {email}
Instagram: {insta}
Working hours: {hours}{branch2}

=== HOW TO ORDER ONLINE ===
1. Login or register with your phone number and password.
2. Browse Products, tap Add to Cart.
3. Open Cart, then Checkout.
4. Choose Home Delivery and fill the address, or choose Store Pickup.
5. Pay by Cash on Delivery (home delivery only) or online by UPI/GPay/PhonePe/Cards.
6. Track the order in My Orders or Track Order.

=== STORE PICKUP ===
- Choose Store Pickup at checkout. It is prepaid only (pay online).
- You get a pickup OTP after payment (also in My Orders).
- Visit the shop with the OTP during working hours. No delivery charge.

=== DELIVERY ===
- Under 1 kg: FREE across India. 1-2 kg about Rs.80. 2-5 kg about Rs.150.
- Above 5 kg Rs.200+. International from Rs.800.
- Delivery charges apply to State Board, NCERT and TNPSC books online. Store pickup has no charges.
- Returns need an unboxing video, reported within 24 hours of delivery.

{catalog}

=== RULES ===
1. Use ONLY the information above. Never invent books, prices or stock.
2. To suggest books, use the MATCHING BOOKS list. Give name and price.
3. If asked for children's books, suggest from the children list if present.
4. If a specific book is NOT in the list, say it is not in our online list right now and ask the customer to call {phone} or message us on Instagram {insta}.
5. For anything you do not know, ask them to call {phone} or message {insta}.
6. Keep answers short, warm and clear.
7. {lang}
"""


@router.post("/chat")
def chat_with_bot(message: dict, db: Session = Depends(get_db)):
    user_message = (message.get("message") or "").strip()
    language = (message.get("language") or "english").lower()

    if not user_message:
        return {"reply": "Please type a message!"}

    if client is None:
        return {
            "reply": "Chat is temporarily unavailable. Please call +91 9486208869.",
            "status": "error",
            "error": "Groq client not initialised (check GROQ_API_KEY / groq version)",
        }

    try:
        system_prompt = build_system_prompt(db, user_message, language)
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            max_tokens=500,
            temperature=0.2,
        )
        return {
            "reply": response.choices[0].message.content,
            "language_used": language,
            "status": "success",
        }
    except Exception as e:
        traceback.print_exc()
        return {
            "reply": "Sorry, I could not answer right now. Please call +91 9486208869 or message us on Instagram @ayyanarbookcentre.",
            "status": "error",
            "error": str(e),
        }


@router.get("/test")
def test_groq():
    """Open /ai/test in the browser to see if Groq works."""
    if client is None:
        return {"ok": False, "problem": "Groq client not initialised. Check GROQ_API_KEY and groq version."}
    try:
        r = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": "Say OK"}],
            max_tokens=5,
        )
        return {"ok": True, "reply": r.choices[0].message.content}
    except Exception as e:
        return {"ok": False, "problem": str(e)}


@router.get("/health")
def health_check():
    return {"status": "Chatbot running!", "model": MODEL}