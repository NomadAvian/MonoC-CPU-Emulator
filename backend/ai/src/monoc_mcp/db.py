import sqlite3
import uuid
import bcrypt

DB = "../../db/test.db"
#DB = "../../db/monoc.db"

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def init_db():
    try:
        with sqlite3.connect(DB) as conn:
            cursor = conn.cursor()
            # only for dev works!
            cursor.execute("DROP TABLE IF EXISTS users")
            cursor.execute("""
                CREATE TABLE users(
                    username TEXT,
                    email TEXT UNIQUE,
                    password TEXT,
                    token TEXT,
                    saved_codes TEXT
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
            return False  # email exists


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
    import json
    with sqlite3.connect(DB) as conn:
        row = conn.execute("SELECT saved_codes FROM users WHERE token = ?", (token,)).fetchone()
        if not row:
            return False
        try:
            codes = json.loads(row[0] or "[]")
        except Exception:
            codes = []
        codes.append({"name": name, "code": code})
        conn.execute("UPDATE users SET saved_codes = ? WHERE token = ?", (json.dumps(codes), token))
        conn.commit()
        return True


def get_user_codes(token):
    import json
    with sqlite3.connect(DB) as conn:
        row = conn.execute("SELECT saved_codes FROM users WHERE token = ?", (token,)).fetchone()
        if not row:
            return []
        try:
            return json.loads(row[0] or "[]")
        except Exception:
            return []

