# Ollama is the primary model; Gemini is the fallback when Ollama is unavailable

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import HTTPException

from config import CORS_ORIGINS
from chat.ollama import chat as ollama_chat
from chat.gemini import chat as gemini_chat
import db

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
    source: str


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        result, tools_used = await ollama_chat(request.messages, request.source)
        print("[api] responded via Ollama")
    except Exception as e:
        print(f"[api] Ollama unavailable, falling back to Gemini. Error: {e}")
        try:
            result, tools_used = await gemini_chat(request.messages, request.source)
            print("[api] responded via Gemini (fallback)")
        except Exception as gemini_e:
            msg = str(gemini_e)
            lw_msg = msg.lower()
            if "429" in msg or "quota" in lw_msg or "exhausted" in lw_msg:
                msg = "API usage limit reached. Please try again later."
            raise HTTPException(status_code=500, detail=f"AI unavailable: {msg}")
    return {"response": result, "tools_used": tools_used}


class ExplainRequest(BaseModel):
    line_number: int
    source: str


@app.post("/explain")
async def explain_endpoint(request: ExplainRequest):
    prompt = f"Please explain what line {request.line_number} does. Keep it short. Here is the source code for reference:\n{request.source}"
    # TODO: call tool calling loop with this prompt
    return 

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
    id: str


@app.post("/user/codes/delete")
def delete_code(req: DeleteCodeRequest):
    success = db.delete_user_code(req.token, req.id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete code")
    return {"success": True}


# ----------- code library apis ------------
@app.get("/examples")
def get_examples():
    return {"examples": db.get_all_examples()}


@app.get("/examples/{example_id:path}")
def get_example_detail(example_id: str):
    example = db.get_example_by_id(example_id)
    if not example:
        raise HTTPException(status_code=404, detail="Example code not found")
    return example
