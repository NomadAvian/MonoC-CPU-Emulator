import sqlite3
import uuid
import bcrypt
from config import DB_PATH as DB
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone

TOKEN_TTL_DAYS = 7


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

@contextmanager
def get_db():
    """yields a connection that safely closes after use"""
    conn = sqlite3.connect(DB)
    try:
        with conn:
            yield conn
    finally:
        conn.close()

# sqlite database setup
def init_db():
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users(
                    username TEXT,
                    email TEXT UNIQUE,
                    password TEXT,
                    token TEXT,
                    saved_codes TEXT
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_saved_codes(
                    id TEXT PRIMARY KEY,
                    email TEXT NOT NULL,
                    name TEXT NOT NULL,
                    code TEXT NOT NULL,
                    FOREIGN KEY(email) REFERENCES users(email)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS guest_ai_usage(
                    ip_address TEXT PRIMARY KEY,
                    ai_usage INTEGER DEFAULT 0,
                    last_reset_date TEXT
                )
            """)
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN ai_usage INTEGER DEFAULT 0")
            except sqlite3.OperationalError:
                pass
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN last_reset_date TEXT")
            except sqlite3.OperationalError:
                pass
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN token_expires_at TEXT")
            except sqlite3.OperationalError:
                pass
    except sqlite3.OperationalError as e:
        print("[log] failed to connect with sqlite database:", e)


# Run once on import
import os
os.makedirs(os.path.dirname(DB), exist_ok=True)
init_db()


def create_user(username, email, password):
    with get_db() as conn:
        hashed = hash_password(password)
        try:
            conn.execute(
                "INSERT INTO users (username, email, password, saved_codes) VALUES (?, ?, ?, ?)",
                (username, email, hashed, "[]"),
            )
            return True
        except sqlite3.IntegrityError:
            return False


def login_user(email, password):
    with get_db() as conn:
        user = conn.execute(
            "SELECT username, password FROM users WHERE email = ?", (email,)
        ).fetchone()
        if user and verify_password(password, user[1]):
            token = str(uuid.uuid4())
            expires_at = (datetime.now(timezone.utc) + timedelta(days=TOKEN_TTL_DAYS)).isoformat()
            conn.execute(
                "UPDATE users SET token = ?, token_expires_at = ? WHERE email = ?",
                (token, expires_at, email)
            )
            conn.commit()
            return {"username": user[0], "token": token}
    return None


def verify_token(token):
    with get_db() as conn:
        row = conn.execute(
            "SELECT username, token_expires_at FROM users WHERE token = ?", (token,)
        ).fetchone()
        if not row:
            return None
        username, expires_at = row
        if expires_at and datetime.fromisoformat(expires_at) < datetime.now(timezone.utc):
            return None
        return (username,)


def logout_user(token):
    with get_db() as conn:
        conn.execute(
            "UPDATE users SET token = NULL, token_expires_at = NULL WHERE token = ?", (token,)
        )
        conn.commit()


def save_user_code(token, name, code):
    with get_db() as conn:
        user = conn.execute("SELECT email FROM users WHERE token = ?", (token,)).fetchone()
        if not user:
            return False
        email = user[0]
        code_id = str(uuid.uuid4())
        conn.execute("INSERT INTO user_saved_codes (id, email, name, code) VALUES (?, ?, ?, ?)", (code_id, email, name, code))
        conn.commit()
        return True


def get_user_codes(token):
    with get_db() as conn:
        user = conn.execute("SELECT email FROM users WHERE token = ?", (token,)).fetchone()
        if not user:
            return []
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT id, name, code FROM user_saved_codes WHERE email = ?", (user[0],)).fetchall()
        return [dict(r) for r in rows]


def delete_user_code(token, code_id):
    with get_db() as conn:
        user = conn.execute("SELECT email FROM users WHERE token = ?", (token,)).fetchone()
        if not user:
            return False
        email = user[0]
        cursor = conn.execute("DELETE FROM user_saved_codes WHERE id = ? AND email = ?", (code_id, email))
        conn.commit()
        return cursor.rowcount > 0


# sussy ai usage limiter - to be deleted
from datetime import date
from typing import Optional
from config import CHAT_PROMPT_LIMIT

def check_and_increment_ai_usage(token: Optional[str], ip_address: str) -> bool:
    today = date.today().isoformat()
    with get_db() as conn:
        if token:
            user = conn.execute(
                "SELECT email, ai_usage, last_reset_date FROM users WHERE token = ?", (token,)
            ).fetchone()
            if user:
                email, usage, last_reset = user
                if last_reset != today:
                    usage = 0
                if usage >= CHAT_PROMPT_LIMIT:
                    return False
                conn.execute(
                    "UPDATE users SET ai_usage = ?, last_reset_date = ? WHERE email = ?",
                    (usage + 1, today, email)
                )
                conn.commit()
                return True

        if not ip_address:
            ip_address = "unknown"

        guest = conn.execute(
            "SELECT ai_usage, last_reset_date FROM guest_ai_usage WHERE ip_address = ?", (ip_address,)
        ).fetchone()
        if guest:
            usage, last_reset = guest
            if last_reset != today:
                usage = 0
        else:
            usage = 0

        if usage >= CHAT_PROMPT_LIMIT:
            return False

        if guest:
            conn.execute(
                "UPDATE guest_ai_usage SET ai_usage = ?, last_reset_date = ? WHERE ip_address = ?",
                (usage + 1, today, ip_address)
            )
        else:
            conn.execute(
                "INSERT INTO guest_ai_usage (ip_address, ai_usage, last_reset_date) VALUES (?, ?, ?)",
                (ip_address, 1, today)
            )
        conn.commit()
        return True
