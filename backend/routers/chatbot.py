from fastapi import APIRouter
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(prefix="/ai", tags=["AI Chatbot"])
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SHOP_INFO = """
=== AYYANAR BOOK CENTRE — OFFICIAL INFO ===
Shop Name: Ayyanar Book Centre
Address: Dindigul, Tamil Nadu, India - 624 001
Phone: +91 9894235330
Customer Care: +91 9894235330
Email: ayyanarbookcentredgl1@gmail.com
Instagram: @ayyanarbookcentre
Working Hours: Monday to Saturday, 9:00 AM to 8:00 PM

=== DELIVERY INFO ===
Free Delivery: Orders above Rs.1000
Tamil Nadu: Rs.50
Other States: Rs.150
International: Rs.500+
Store Pickup: Available at Dindigul shop (Prepaid orders only)
Worldwide Delivery: Yes available

=== PRODUCT CATEGORIES ===
1. State Board Books & Guides (Science, Maths, English, Tamil, Social Science)
2. CBSE Books & Guides (All subjects, All classes)
3. Tamil Nadu Textbooks (Samacheer Kalvi - State Board)
4. TNPSC Books (Group 1, 2, 4, VAO, TET, TNTET)
5. NCERT Books (All classes)
6. Notebooks & Stationery
7. Medical Books & College Books
8. Children Books & Story Books
9. Novels (Tamil & English)
10. Motivational Books
11. Customised Gifts & Hampers
12. School Projects & Teacher Training Models
13. School Accessories (Bags, Water Bottles, Lunch Boxes, Pencil Boxes)
14. Combos (Book + Stationery sets)
15. Wholesale for Schools & Colleges (MOU available)

=== STRICT RULES — MUST FOLLOW ===
RULE 1: Use ONLY the above information to answer
RULE 2: If someone asks for phone → give +91 9894235330
RULE 3: If someone asks for email → give ayyanarbookcentredgl1@gmail.com
RULE 4: If someone asks anything NOT in above info → say exactly:
         "I don't have that information. Please contact customer care at +91 9894235330"
RULE 5: NEVER guess or make up any information
RULE 6: NEVER give random phone numbers or addresses
"""

LANG_RULES = {
    "english": "Reply in English only.",
    "tamil": "எப்போதும் தமிழிலேயே பதில் சொல்லுங்கள்.",
    "tanglish": "Reply in Tanglish only (Tamil words in English letters). Example: 'Neenga phone pannunga +91 9894235330 la'"
}

@router.post("/chat")
def chat_with_bot(message: dict):
    user_message = message.get("message", "")
    language = message.get("language", "english").lower()

    if not user_message:
        return {"reply": "Please send a message!"}

    system_prompt = (
        SHOP_INFO + "\n\n" +
        LANG_RULES.get(language, LANG_RULES["english"])
    )

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=500,
            temperature=0.1
        )
        return {
            "reply": response.choices[0].message.content,
            "language_used": language,
            "status": "success"
        }
    except Exception as e:
        return {
            "reply": "Sorry! Please contact +91 9894235330",
            "status": "error"
        }

@router.get("/health")
def health_check():
    return {"status": "Chatbot running!"}