# frontend POST messages here and receive the AI response
# Ollama is the primary model; Gemini is the fallback when Ollama is unavailable

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import monoc_mcp.db as db
from monoc_mcp.config import CORS_ORIGINS
from monoc_mcp.chat_service import chat as ollama_chat
from monoc_mcp.gemini_chat_service import chat as gemini_chat

# CORS policy management
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------- chat apis -------------
class ChatRequest(BaseModel):
    messages: list[dict]


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        result = ollama_chat(request.messages)
        print("[api] responded via Ollama")
    except Exception as e:
        print(f"[api] Ollama unavailable , falling back to Gemini")
        result = gemini_chat(request.messages)
        print("[api] responded via Gemini (fallback)")
    return {"response": result}

# ----------- auth apis -----------

class SignupRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/auth/signup")
def signup(req: SignupRequest):
    if not db.create_user(req.username, req.email, req.password):
        raise HTTPException(status_code=400, detail="Email already registered")
    return {"success": True}


@app.post("/auth/login")
def login(req: LoginRequest):
    res = db.login_user(req.email, req.password)
    if not res:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return res


# ----------- user apis ------------ 
class SaveCodeRequest(BaseModel):
    token: str
    name: str
    code: str


@app.post("/user/codes")
def save_code(req: SaveCodeRequest):
    success = db.save_user_code(req.token, req.name, req.code)
    if not success:
        raise HTTPException(status_code=401, detail="Invalid session token")
    return {"success": True}


@app.get("/user/codes")
def get_codes(token: str):
    return {"codes": db.get_user_codes(token)}


class DeleteCodeRequest(BaseModel):
    token: str
    name: str


@app.post("/user/codes/delete")
def delete_code(req: DeleteCodeRequest):
    success = db.delete_user_code(req.token, req.name)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete code")
    return {"success": True}


# ----------- example code library apis ------------
@app.get("/examples")
def get_examples():
    return {"examples": db.get_all_examples()}


@app.get("/examples/{example_id:path}")
def get_example_detail(example_id: str):
    example = db.get_example_by_id(example_id)
    if not example:
        raise HTTPException(status_code=404, detail="Example code not found")
    return example



