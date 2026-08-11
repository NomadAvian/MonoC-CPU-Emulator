import sqlite3
import uuid

from passlib.context import CryptContext

DB = "../../db/test.db"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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
        hashed = pwd_context.hash(password)
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
        if user and pwd_context.verify(password, user[1]):
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
