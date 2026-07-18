import os
import mimetypes
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Dict
from app.rag import get_rag_response

# Fix Windows registry mimetypes bug for CSS and JS
mimetypes.init()
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/javascript", ".js")

app = FastAPI(
    title="Hatim Portfolio AI API",
    description="FastAPI Backend for RAG Chatbot integrated in Hatim Maachi's Portfolio",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev; restrict in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request validation schemas
class ChatMessage(BaseModel):
    role: str = Field(description="Role of the sender, either 'user' or 'assistant'")
    content: str = Field(description="The actual text content of the message")

class ChatRequest(BaseModel):
    message: str = Field(description="The new message from the user")
    history: List[ChatMessage] = Field(default=[], description="List of previous messages in the conversation")

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # Convert Pydantic schemas to standard dictionaries for our RAG function
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]
        
        response = get_rag_response(request.message, history_dicts)
        return {"response": response}
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during LLM completion.")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "FastAPI is running and ready."}

# Mount static files
# 1. Mount the React compiled chat widget under /chat if it exists
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
chat_dist_dir = os.path.join(base_dir, "chat-widget", "dist")

if os.path.exists(chat_dist_dir):
    print(f"Mounting compiled React chat widget at /chat (from {chat_dist_dir})")
    app.mount("/chat", StaticFiles(directory=chat_dist_dir, html=True), name="chat")
else:
    print(f"Notice: React build not found at {chat_dist_dir}. Chat widget won't be available at /chat until built.")

# 2. Mount the main portfolio static files at the root (/)
# We mount this last so it acts as a fallback for routes not caught by api/chat or chat
portfolio_dir = base_dir
if os.path.exists(os.path.join(portfolio_dir, "index.html")):
    print(f"Mounting portfolio static files at / (from {portfolio_dir})")
    app.mount("/", StaticFiles(directory=portfolio_dir, html=True), name="portfolio")
else:
    print(f"Warning: portfolio files (index.html) not found in {portfolio_dir}")
