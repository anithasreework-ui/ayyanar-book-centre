# 📚 AI-Powered Bookshop — Production-Ready LLM System

## 🚀 Overview
This project is a **production-ready AI-powered bookshop platform** that enables conversational book discovery using natural language.

Unlike basic chatbot demos, this system is designed for **real-world usage**, integrating LLMs with live inventory data using a Retrieval-Augmented Generation (RAG) pipeline.

👉 Live Demo: https://ayyanar-book-centre.vercel.app/

---

## 🧠 Key Features

- Conversational book search
- Context-aware recommendations
- Real-time inventory integration
- Retrieval-Augmented Generation (RAG)
- Scalable backend architecture

---

## 🏗️ Architecture

### Frontend
- Next.js (chat interface)

### Backend
- FastAPI (API orchestration)
- Prompt engineering & context injection

### AI Layer
- LLaMA 3 via Ollama
- Controlled response generation

### Database
- Supabase (PostgreSQL)

---

## 🔄 System Flow

1. User sends a query  
2. Backend retrieves relevant book data (RAG)  
3. Context is injected into the LLM  
4. LLM generates a grounded response  
5. Response is returned to the user  

---

## ⚙️ Tech Stack

- Next.js  
- FastAPI  
- Supabase  
- Ollama (LLaMA 3)  
- RAG pipeline  

---

## ⚠️ Production Considerations

- Hallucination reduction via grounding  
- Token and cost optimization  
- Latency-aware backend design  
- Error handling and fallback logic  

---

## 📈 Future Improvements

- Multi-tenant SaaS model (for bookstores)
- Admin dashboard for store owners
- Personalization & analytics

---
