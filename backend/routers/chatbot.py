from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI Chatbot"])
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def get_shop_info(db: Session) -> str:
    try:
        result = db.execute(
            text("SELECT key, value FROM shop_settings")
        ).fetchall()
        settings = {row[0]: row[1] for row in result}

        # Branch 2 — இருந்தா மட்டும் add பண்ணு
        branch2 = ""
        if settings.get("branch_2_name", "").strip():
            branch2 = f"""
Branch 2 Name: {settings.get('branch_2_name', '')}
Branch 2 Address: {settings.get('branch_2_address', '')}
Branch 2 Phone: {settings.get('branch_2_phone', '')}"""

        return f"""
=== AYYANAR BOOK CENTRE — OFFICIAL SHOP INFO ===
Shop Name: {settings.get('shop_name', 'Ayyanar Book Centre')}
Address: {settings.get('shop_address', 'Dindigul, Tamil Nadu, India - 624 001')}
Phone: {settings.get('phone', '+91 9894235330')}
Customer Care: {settings.get('customer_care', '+91 9894235330')}
Email: {settings.get('email', 'ayyanarbookcentredgl1@gmail.com')}
Instagram: {settings.get('instagram', '@ayyanarbookcentre')}
Working Hours: {settings.get('working_hours', 'Monday to Saturday, 9:00 AM to 8:00 PM')}
Tagline: {settings.get('tagline', 'Knowledge is the floor of success')}{branch2}

=== DELIVERY INFO ===
Free Delivery: Under 1kg — FREE across India
Tamil Nadu (above 1kg): Rs.80
Other States (above 1kg): Rs.150
International: Rs.800+
Store Pickup: Available at Dindigul shop (Prepaid orders only)
Worldwide Delivery: Yes, available

=== PRODUCT CATEGORIES ===
1. State Board Textbooks & Guides
2. State Board (TNPSC) Competitive Books
3. CBSE Textbooks & Guides
4. Central Board Competitive Books
5. NCERT / NEET Books
6. Medical Books
7. Stationery
8. Children Books
9. Novels
10. Motivational Books
11. Gifts & Hampers
12. School Projects & Teacher Training
13. Combos
14. Wholesale (Schools & Colleges — MOU available)

=== STRICT RULES — MUST FOLLOW ===
RULE 1: Use ONLY the above information to answer questions
RULE 2: If customer asks for phone number → give exact number from above
RULE 3: If customer asks for address → give exact address from above
RULE 4: If customer asks for email → give exact email from above
RULE 5: If you don't know the answer → say exactly:
         "I don't have that information. Please contact our customer care at [phone number from above]"
RULE 6: NEVER guess, make up, or give random information
RULE 7: NEVER give a phone number that is not in the above info
RULE 8: Be friendly, helpful and professional always
"""
    except Exception:
        # Fallback if DB fails
        return """
=== AYYANAR BOOK CENTRE ===
Shop Name: Ayyanar Book Centre
Address: Dindigul, Tamil Nadu, India - 624 001
Phone: +91 9894235330
Customer Care: +91 9894235330
Email: ayyanarbookcentredgl1@gmail.com
Instagram: @ayyanarbookcentre
Working Hours: Monday to Saturday, 9:00 AM to 8:00 PM

Delivery: Free under 1kg | TN Rs.80 | Other states Rs.150 | International Rs.800+
Store Pickup: Available (Prepaid only)

RULE: If unknown question, say contact customer care at +91 9894235330
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