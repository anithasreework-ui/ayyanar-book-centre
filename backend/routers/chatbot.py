from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI Chatbot"])
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def get_shop_info(db: Session) -> str:
    try:
        from sqlalchemy import text
        result = db.execute(
            text("SELECT key, value FROM shop_settings")
        ).fetchall()
        settings = {row[0]: row[1] for row in result}

        # Get products
        products = db.query(models.Product).filter(
            models.Product.is_available == True
        ).all()

        product_list = ""
        if products:
            product_list = "\n=== AVAILABLE PRODUCTS ===\n"
            for p in products[:20]:  # First 20
                product_list += (
                    f"- {p.name}: Rs.{p.price} "
                    f"(Category: {p.category})\n"
                )

        branch2 = ""
        if settings.get("branch_2_name", "").strip():
            branch2 = f"""
Branch 2: {settings.get('branch_2_name')}
Branch 2 Address: {settings.get('branch_2_address')}
Branch 2 Phone: {settings.get('branch_2_phone')}"""

        return f"""
=== AYYANAR BOOK CENTRE — OFFICIAL INFO ===
Shop Name: {settings.get('shop_name', 'Ayyanar Book Centre')}
Address: {settings.get('shop_address', 'Dindigul, Tamil Nadu')}
Phone: {settings.get('phone', '+91 9486208869')}
Customer Care: {settings.get('customer_care', '+91 9486208869')}
Email: {settings.get('email', 'ayyanarbookcentredgl1@gmail.com')}
Instagram: {settings.get('instagram', '@ayyanarbookcentre')}
Working Hours: {settings.get('working_hours', 'Mon-Sat 9AM-9PM')}
Tagline: {settings.get('tagline', 'Knowledge is the floor of success')}
{branch2}

=== DELIVERY INFO ===
Free Delivery: Under 1kg — FREE across India
Tamil Nadu (above 1kg): Rs.80
Other States: Rs.150
International: Rs.800+
Store Pickup: No charges — Collect at Dindigul
Worldwide: Yes, available

=== CATEGORIES ===
State Board Textbooks, TNPSC Books, CBSE Books,
NCERT/NEET Books, Medical Books, Stationery,
Children Books, Novels, Motivational, Gifts,
School Projects, Combos, Wholesale
{product_list}

=== RULES ===
1. Answer ONLY from above info
2. Phone asked → give exact number
3. Books asked → check product list above
4. Unknown → say contact us at phone number
5. Be friendly and helpful
6. Support Tamil, English, Tanglish
"""
    except Exception:
        return """
Shop: Ayyanar Book Centre, Dindigul
Phone: +91 9486208869
Email: ayyanarbookcentredgl1@gmail.com
Hours: Mon-Sat 9AM-9PM
"""


LANG_RULES = {
    "english": "You MUST reply in English only.",
    "tamil": "நீங்கள் எப்போதும் தமிழிலேயே மட்டும் பதில் சொல்லுங்கள்.",
    "tanglish": "You MUST reply in Tanglish only (Tamil words written in English letters). Example: 'Neenga +91 9894235330 la call pannunga, naanga help pannuvom!'"
}


@router.post("/chat")
def chat_with_bot(
    message: dict,
    db: Session = Depends(get_db)
):
    user_message = message.get("message", "").strip()
    language = message.get("language", "english").lower()

    if not user_message:
        return {"reply": "Please send a message!"}

    # DB-லிருந்து shop info எடு
    shop_info = get_shop_info(db)
    lang_rule = LANG_RULES.get(language, LANG_RULES["english"])

    system_prompt = f"""{shop_info}

=== LANGUAGE RULE ===
{lang_rule}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            max_tokens=500,
            temperature=0.1
        )

        reply = response.choices[0].message.content

        return {
            "reply": reply,
            "language_used": language,
            "status": "success"
        }

    except Exception as e:
        return {
            "reply": "Sorry! Please contact our customer care at +91 9894235330",
            "status": "error",
            "error": str(e)
        }


@router.get("/health")
def health_check():
    return {
        "status": "Chatbot running!",
        "model": "llama-3.3-70b-versatile"
    }