import sqlite3
import uuid
import bcrypt
from config import DB_PATH as DB

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

# sqlite database setup
def init_db():
    try:
        with sqlite3.connect(DB) as conn:
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
            conn.commit()
    except sqlite3.OperationalError as e:
        print("[log] failed to connect with sqlite database:", e)


# Run once on import
init_db()


def create_user(username, email, password):
    with sqlite3.connect(DB) as conn:
        hashed = hash_password(password)
        try:
            conn.execute(
                "INSERT INTO users (username, email, password, saved_codes) VALUES (?, ?, ?, ?)",
                (username, email, hashed, "[]"),
            )
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False  


def login_user(email, password):
    with sqlite3.connect(DB) as conn:
        user = conn.execute(
            "SELECT username, password FROM users WHERE email = ?", (email,)
        ).fetchone()
        if user and verify_password(password, user[1]):
            token = str(uuid.uuid4())
            conn.execute("UPDATE users SET token = ? WHERE email = ?", (token, email))
            conn.commit()
            return {"username": user[0], "token": token}
    return None


def verify_token(token):
    with sqlite3.connect(DB) as conn:
        return conn.execute(
            "SELECT username FROM users WHERE token = ?", (token,)
        ).fetchone()


def save_user_code(token, name, code):
    with sqlite3.connect(DB) as conn:
        user = conn.execute("SELECT email FROM users WHERE token = ?", (token,)).fetchone()
        if not user:
            return False
        email = user[0]
        code_id = str(uuid.uuid4())
        conn.execute("INSERT INTO user_saved_codes (id, email, name, code) VALUES (?, ?, ?, ?)", (code_id, email, name, code))
        conn.commit()
        return True


def get_user_codes(token):
    with sqlite3.connect(DB) as conn:
        user = conn.execute("SELECT email FROM users WHERE token = ?", (token,)).fetchone()
        if not user:
            return []
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT id, name, code FROM user_saved_codes WHERE email = ?", (user[0],)).fetchall()
        return [dict(r) for r in rows]


def delete_user_code(token, code_id):
    with sqlite3.connect(DB) as conn:
        user = conn.execute("SELECT email FROM users WHERE token = ?", (token,)).fetchone()
        if not user:
            return False
        email = user[0]
        cursor = conn.execute("DELETE FROM user_saved_codes WHERE id = ? AND email = ?", (code_id, email))
        conn.commit()
        return cursor.rowcount > 0




