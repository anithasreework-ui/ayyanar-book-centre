from fastapi import APIRouter
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI Chatbot"])

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPTS = {
    "english": """You are a helpful assistant for Ayyanar Book Centre,
a bookshop in Dindigul, Tamil Nadu, India.
Help customers find books, stationery, school accessories.
Categories: TNPSC books, NCERT, Tamil Nadu textbooks, novels,
motivational books, children books, stationery, school bags,
water bottles, customised gifts, wholesale for schools and colleges.
Delivery: Home delivery all over India and worldwide.
Store pickup available at Dindigul shop.
ALWAYS reply in English only.""",

    "tamil": """நீங்கள் திண்டுக்கல்லில் உள்ள அய்யனார் புத்தக மையத்தின் உதவியாளர்.
வாடிக்கையாளர்களுக்கு புத்தகங்கள், எழுதுபொருட்கள் கண்டுபிடிக்க உதவுகிறீர்கள்.
வகைகள்: TNPSC புத்தகங்கள், NCERT, தமிழ்நாடு பாடப்புத்தகங்கள், நாவல்கள்,
உந்துதல் புத்தகங்கள், குழந்தை புத்தகங்கள், எழுதுபொருட்கள், பள்ளி பைகள்.
டெலிவரி: இந்தியா மற்றும் உலகம் முழுவதும். கடையில் எடுக்கவும் வரலாம்.
எப்போதும் தமிழிலேயே பதில் சொல்லுங்கள்.""",

    "tanglish": """You are a helpful assistant for Ayyanar Book Centre in Dindigul.
Help customers find books and stationery items.
Categories: TNPSC books, NCERT, Tamil Nadu textbooks, novels,
motivational books, children books, stationery, school accessories.
Delivery available all over India and worldwide.
ALWAYS reply in Tanglish only (Tamil words written in English letters).
Example: 'Neenga TNPSC padikreenga-na, indha book best-a irukkum!'"""
}


@router.post("/chat")
def chat_with_bot(message: dict):
    user_message = message.get("message", "")
    language = message.get("language", "english").lower()

    if not user_message:
        return {"reply": "Please send a message!"}

    system_prompt = SYSTEM_PROMPTS.get(language, SYSTEM_PROMPTS["english"])

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
            temperature=0.7
        )

        reply = response.choices[0].message.content

        return {
            "reply": reply,
            "language_used": language,
            "status": "success"
        }

    except Exception as e:
        return {
            "reply": "Sorry, chatbot unavailable. Please call us directly!",
            "status": "error",
            "error": str(e)
        }


@router.get("/health")
def health_check():
    return {"status": "Groq + Llama3 Chatbot running! ✅"}