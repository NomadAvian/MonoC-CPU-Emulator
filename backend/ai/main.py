import warnings
warnings.filterwarnings("ignore")

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import HTTPException

from config import CORS_ORIGINS
from chat.ollama import chat as ollama_chat
from chat.omniroute import chat as omniroute_chat
from chat.gemini import chat as gemini_chat
import db
from typing import Optional

# CORS policy management
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}

# ------------- chat apis -------------
class ChatRequest(BaseModel):
    messages: list[dict]
    source: str
    token: Optional[str] = None


async def _do_chat(messages: list[dict], source: str) -> tuple[str, list[str]]:
    try:
        result, tools_used = await ollama_chat(messages, source)
        print("[api] responded via Ollama")
        return result, tools_used
    except Exception as e:
        print(f"[api] Ollama unavailable, falling back to OmniRoute. Error: {e}")
        try:
            result, tools_used = await omniroute_chat(messages, source)
            print("[api] responded via OmniRoute (fallback)")
            return result, tools_used
        except Exception as omniroute_e:
            import traceback
            print(f"[api] OmniRoute unavailable, falling back to Gemini. Error:")
            traceback.print_exc()
            try:
                result, tools_used = await gemini_chat(messages, source)
                print("[api] responded via Gemini (fallback)")
                return result, tools_used
            except Exception as gemini_e:
                msg = str(gemini_e)
                lw_msg = msg.lower()
                if "429" in msg or "quota" in lw_msg or "exhausted" in lw_msg:
                    msg = "API usage limit reached. Please try again later."
                raise HTTPException(status_code=500, detail=f"AI unavailable: {msg}")

@app.post("/chat")
async def chat_endpoint(request: ChatRequest, req: Request):
    ip_address = req.headers.get("x-forwarded-for") or req.client.host
    if not db.check_and_increment_ai_usage(request.token, ip_address):
        raise HTTPException(status_code=429, detail="Daily AI usage limit reached. Please try again tomorrow.")
    result, tools_used = await _do_chat(request.messages, request.source)
    return {"response": result, "tools_used": tools_used}


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
