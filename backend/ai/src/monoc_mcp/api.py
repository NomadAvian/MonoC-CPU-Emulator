# frontend will POST messages here and receive the AI response
# React (:5173) -> POST /chat -> FastAPI (:8000) -> chat_service.py -> Ollama
 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
#from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from monoc_mcp.chat_service import chat

# the shape of the JSON body validated by Pydantic
class ChatRequest(BaseModel):
    messages: list[dict]

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


#   receives a ChatRequest (list of messages) from the frontend
#   calls chat() function from chat_service.py
@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    result = chat(request.messages)
    return {"response": result}


# SSE FORMAT: Each event is sent as:
#   data: {"token": "Hello"}\n\n
#   data: {"token": " world"}\n\n
#   data: [DONE]\n\n
#
# To stream in FastAPI:
#   1. Create a generator function that yields SSE-formatted strings
#   2. Return StreamingResponse(generator(), media_type="text/event-stream")
#
# For now you can skip this and just return the full response.
# The frontend (Exercise 3) will handle both cases.


