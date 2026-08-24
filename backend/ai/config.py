import os
from pathlib import Path
from dotenv import load_dotenv

# load .env from project root (gitignored). docker injects vars directly — no file needed.
_root_dir = Path(__file__).parent.parent.parent  # backend/ai -> backend -> root
load_dotenv(_root_dir / ".env", override=False)

# --- user config (from .env) ---
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL   = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
OLLAMA_MODEL   = os.environ.get("OLLAMA_MODEL", "qwen2.5:7b")
OLLAMA_HOST    = os.environ.get("OLLAMA_HOST", "")
OMNIROUTE_API_KEY = os.environ.get("OMNIROUTE_API_KEY", "dummy")
OMNIROUTE_BASE_URL= os.environ.get("OMNIROUTE_BASE_URL", "http://localhost:20128/v1")
OMNIROUTE_MODEL   = os.environ.get("OMNIROUTE_MODEL", "auto")

# --- internal networking (docker overrides these via environment: in compose) ---
CROW_BASE_URL = os.environ.get("CROW_BASE_URL", "http://localhost:6969")
DB_PATH       = os.environ.get("DB_PATH", str((_root_dir / "backend" / "db" / "monoc.db").resolve()))

_cors_raw = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:8000,http://localhost:6969"
)
CORS_ORIGINS = [o.strip() for o in _cors_raw.split(",") if o.strip()]
