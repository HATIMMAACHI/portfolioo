import os
import json
import uuid
import hmac
import hashlib
import time
import mimetypes
from fastapi import FastAPI, HTTPException, Header, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from app.rag import get_rag_response

SECRET_KEY = os.getenv("JWT_SECRET", "hatim_sdsi_portfolio_secret_key_2026")

def generate_session_token():
    expires_at = int(time.time()) + 86400
    message = f"{expires_at}"
    signature = hmac.new(SECRET_KEY.encode(), message.encode(), hashlib.sha256).hexdigest()
    return f"{message}.{signature}"

def verify_session_token(token: str) -> bool:
    if not token or "." not in token:
        return False
    try:
        expires_at_str, signature = token.split(".", 1)
        expires_at = int(expires_at_str)
        if time.time() > expires_at:
            return False
        expected_signature = hmac.new(SECRET_KEY.encode(), expires_at_str.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(signature, expected_signature)
    except Exception:
        return False

# Fix Windows registry mimetypes bug for CSS and JS
mimetypes.init()
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/javascript", ".js")

app = FastAPI(
    title="Hatim Portfolio AI API & Admin Portal",
    description="FastAPI Backend with content management APIs",
    version="1.1.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path setup
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
profile_json_path = os.path.join(base_dir, "backend", "data", "profile.json")

# In-memory admin session storage
admin_sessions = set()

# Request schemas
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class AdminLoginRequest(BaseModel):
    password: str

# Helper to verify session token
def verify_admin_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Jeton de session requis")
    
    # Support both Bearer token and raw token header format
    token = authorization.replace("Bearer ", "").strip()
    if token not in admin_sessions:
        raise HTTPException(status_code=403, detail="Session expirée ou invalide")
    return token

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]
        response = get_rag_response(request.message, history_dicts)
        return {"response": response}
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during LLM completion.")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "FastAPI is running and ready."}

# Profile API - Public
@app.get("/api/profile")
async def get_profile():
    if not os.path.exists(profile_json_path):
        raise HTTPException(status_code=404, detail="Profil non configuré")
    try:
        with open(profile_json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de lecture du profil: {str(e)}")

# Admin Auth API
@app.post("/api/admin/login")
async def admin_login(payload: AdminLoginRequest):
    correct_password = os.getenv("ADMIN_PASSWORD", "admin123")
    if payload.password == correct_password:
        token = str(uuid.uuid4())
        admin_sessions.add(token)
        return {"status": "ok", "token": token}
    raise HTTPException(status_code=401, detail="Mot de passe incorrect")

# Admin Profile GET - Protected
@app.get("/api/admin/profile")
async def get_admin_profile(token: str = Depends(verify_admin_token)):
    return await get_profile()

# Admin Profile POST - Protected
@app.post("/api/admin/profile")
async def update_admin_profile(
    payload: dict, 
    background_tasks: BackgroundTasks,
    token: str = Depends(verify_admin_token)
):
    try:
        # Validate profile layout basic keys
        if "name" not in payload:
            raise HTTPException(status_code=400, detail="Format de profil invalide: le nom est requis")
            
        with open(profile_json_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
            
        # Trigger vector database re-ingestion asynchronously
        from app.ingest import reingest_profile
        background_tasks.add_task(reingest_profile)
        
        return {"status": "ok", "message": "Profil mis à jour et ré-indexé avec succès !"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de sauvegarde: {str(e)}")

# Admin Portal Dashboard Static Route
@app.get("/admin")
async def get_admin_portal():
    admin_html_path = os.path.join(base_dir, "admin.html")
    if os.path.exists(admin_html_path):
        return FileResponse(admin_html_path)
    raise HTTPException(status_code=404, detail="Page admin.html manquante")

# Mount Static Files
chat_dist_dir = os.path.join(base_dir, "chat-widget", "dist")
if os.path.exists(chat_dist_dir):
    print(f"Mounting compiled React chat widget at /chat (from {chat_dist_dir})")
    app.mount("/chat", StaticFiles(directory=chat_dist_dir, html=True), name="chat")

portfolio_dir = base_dir
if os.path.exists(os.path.join(portfolio_dir, "index.html")):
    print(f"Mounting portfolio static files at / (from {portfolio_dir})")
    app.mount("/", StaticFiles(directory=portfolio_dir, html=True), name="portfolio")
