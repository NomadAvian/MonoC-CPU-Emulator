import os
from pathlib import Path
from dotenv import load_dotenv

# path resolution relative to this file
_pkg_dir = Path(__file__).parent               # backend/ai/src/monoc_mcp
_ai_dir = Path(__file__).parents[2]            # backend/ai
_backend_dir = Path(__file__).parents[3]       # backend

if (_pkg_dir / ".env").exists():
    load_dotenv(_pkg_dir / ".env")
elif (_ai_dir / ".env").exists():
    load_dotenv(_ai_dir / ".env")

_default_db = str((_backend_dir / "db" / "test.db").resolve())

# environment variables with defaults
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "bjoernb/gemma4-e4b-think:latest")
CROW_BASE_URL = os.environ.get("CROW_BASE_URL", "http://localhost:6969")
DB_PATH = os.environ.get("DB_PATH", _default_db)

_cors_raw = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:6969,http://localhost:5173,http://localhost:8000"
)
CORS_ORIGINS = [origin.strip() for origin in _cors_raw.split(",") if origin.strip()]
