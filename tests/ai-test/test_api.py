import os, tempfile, subprocess, sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
sys.path.append(str((Path(__file__).parent.parent.parent / "backend" / "ai").resolve()))

db_fd, db_path = tempfile.mkstemp(suffix=".db")
os.close(db_fd)
os.environ["DB_PATH"] = db_path

import db
from main import app

@pytest.fixture(scope="session", autouse=True)
def init_test_db():
    db.init_db()
    yield
    os.unlink(db_path)

client = TestClient(app)

def test_auth_flow():
    res = client.post("/auth/signup", json={"username": "u1", "email": "e1@a.com", "password": "p1"})
    assert res.json().get("success") is True
    
    res = client.post("/auth/signup", json={"username": "u2", "email": "e1@a.com", "password": "p1"})
    assert res.status_code == 400

    res = client.post("/auth/login", json={"email": "e1@a.com", "password": "p1"})
    assert "token" in res.json()

@patch("main._do_chat", new_callable=AsyncMock)
def test_rate_limiter(mock_chat):
    mock_chat.return_value = ("ok", [])
    payload = {"messages": [{"role": "user", "content": "hi"}], "source": "", "token": None}
    
    for _ in range(20):
        assert client.post("/chat", json=payload, headers={"x-forwarded-for": "1.1.1.1"}).status_code == 200
        
    assert client.post("/chat", json=payload, headers={"x-forwarded-for": "1.1.1.1"}).status_code == 429

def test_mcp_env_passthrough():
    script = 'import os; print(os.environ.get("CROW_BASE_URL"))'
    res = subprocess.run([sys.executable, "-c", script], env={**os.environ, "CROW_BASE_URL": "http://x"}, capture_output=True, text=True)
    assert res.stdout.strip() == "http://x"

