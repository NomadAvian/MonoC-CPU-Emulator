import warnings
warnings.filterwarnings("ignore")

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from config import CORS_ORIGINS
from chat.ollama import chat as ollama_chat
from chat.omniroute import chat as omniroute_chat
from chat.gemini import chat as gemini_chat
import db
from typing import Optional

def get_real_ip(request: Request) -> str:
    """
    Extract real client IP from X-Forwarded-For header when behind reverse proxy.
    Falls back to direct client host if header is missing.
    """
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # X-Forwarded-For can be a comma-separated list; first entry is the original client
        return forwarded.split(",")[0].strip()
    # Direct connection (dev mode) or no proxy header
    return request.client.host if request.client else "unknown"

limiter = Limiter(key_func=get_real_ip)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)


def _extract_token(creds: Optional[HTTPAuthorizationCredentials]) -> Optional[str]:
    return creds.credentials if creds else None


def _require_token(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> str:
    token = _extract_token(creds)
    if not token or not db.verify_token(token):
        raise HTTPException(status_code=401, detail="Invalid or expired session token")
    return token


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
    raw_ip = req.headers.get("x-forwarded-for") or (req.client.host if req.client else "unknown")
    ip_address = raw_ip.split(",")[0].strip() if raw_ip else "unknown"
    if not db.check_and_increment_ai_usage(request.token, ip_address):
        raise HTTPException(status_code=429, detail="Daily AI usage limit reached. Please try again tomorrow.")
    result, tools_used = await _do_chat(request.messages, request.source)
    return {"response": result, "tools_used": tools_used}


# ----------- auth apis -----------
class SignupRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=64)
    email: str = Field(..., min_length=3, max_length=254)
    password: str = Field(..., min_length=8, max_length=72)


class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/auth/signup")
@limiter.limit("10/minute")
def signup(req: SignupRequest, request: Request):
    if not db.create_user(req.username, req.email, req.password):
        raise HTTPException(status_code=400, detail="Signup failed")
    return {"success": True}


@app.post("/auth/login")
@limiter.limit("10/minute")
def login(req: LoginRequest, request: Request):
    res = db.login_user(req.email, req.password)
    if not res:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return res


@app.post("/auth/logout")
def logout(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    token = _extract_token(creds)
    if token:
        db.logout_user(token)
    return {"success": True}


# ----------- user apis ------------
class SaveCodeRequest(BaseModel):
    name: str
    code: str


@app.post("/user/codes")
def save_code(req: SaveCodeRequest, token: str = Depends(_require_token)):
    success = db.save_user_code(token, req.name, req.code)
    if not success:
        raise HTTPException(status_code=401, detail="Invalid session token")
    return {"success": True}


@app.get("/user/codes")
def get_codes(token: str = Depends(_require_token)):
    return {"codes": db.get_user_codes(token)}


class DeleteCodeRequest(BaseModel):
    id: str


@app.post("/user/codes/delete")
def delete_code(req: DeleteCodeRequest, token: str = Depends(_require_token)):
    success = db.delete_user_code(token, req.id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete code")
    return {"success": True}
