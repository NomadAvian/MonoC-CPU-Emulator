# frontend POST messages here and receive the AI response
# Ollama is the primary model; Gemini is the fallback when Ollama is unavailable

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from monoc_mcp.chat_service import chat as ollama_chat
from monoc_mcp.gemini_chat_service import chat as gemini_chat

# CORS policy management
app = FastAPI()
origins = [
    "http://localhost:6969", # crow
    "http://localhost:5173", # react
    "http://localhost:8000", # default
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# the shape of the JSON body validated by Pydantic
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
