import sqlite3
import uuid
import bcrypt
from config import DB_PATH as DB

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


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
                CREATE TABLE IF NOT EXISTS code_examples(
                    id TEXT PRIMARY KEY,
                    category TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT,
                    source TEXT NOT NULL
                )
            """)
            # Seed 1 example
            cursor.execute("""
                INSERT OR IGNORE INTO code_examples (id, category, title, description, source)
                VALUES (?, ?, ?, ?, ?)
            """, (
                "basic/add-two-numbers",
                "Basic",
                "Add Two Numbers",
                "Simple addition of two immediate values into registers",
                "# Program: Simple Addition Example\n# Goal: Calculate 10 + 25\n\n.global _start\n_start:\n    li a0, 10       # Load immediate value 10 into register a0\n    li a1, 25       # Load immediate value 25 into register a1\n    add t0, a0, a1   # Add values in a0 and a1 into t0\n"
            ))
            # Seed a screen example: prints "MonoC" to the 128x96 b&w framebuffer.
            cursor.execute("""
                INSERT OR IGNORE INTO code_examples (id, category, title, description, source)
                VALUES (?, ?, ?, ?, ?)
            """, (
                "graphics/monoc-screen",
                "Graphics",
                "Print 'MonoC' to Screen",
                "Draws the word 'MonoC' on the emulator screen",
                "# MonoC screen\n"
                "\n"
                ".global _start\n"
                "\n"
                ".data\n"
                "font_data:\n"
                "    # 'M' (5x7), 1 bit per pixel, bit c = column c (LSB = col 0)\n"
                "    .byte 0x11, 0x1B, 0x15, 0x11, 0x11, 0x11, 0x11\n"
                "    # 'o'\n"
                "    .byte 0x0E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E\n"
                "    # 'n'\n"
                "    .byte 0x11, 0x13, 0x15, 0x19, 0x11, 0x11, 0x11\n"
                "    # 'o'\n"
                "    .byte 0x0E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E\n"
                "    # 'C'\n"
                "    .byte 0x1E, 0x01, 0x01, 0x01, 0x01, 0x01, 0x1E\n"
                "\n"
                ".text\n"
                "_start:\n"
                "    li   s0, 0x07FFD000     # framebuffer base address\n"
                "    li   t1, 4366           # y=34 -> 34*128=4352, x=14 -> +14\n"
                "    add  s0, s0, t1         # s0 = top-left of \"MonoC\"\n"
                "\n"
                "    la   t0, font_data      # t0 = pointer into the font table\n"
                "\n"
                "    li   s1, 0              # letter index 0..4\n"
                "letter_loop:\n"
                "    li   s2, 0              # row index 0..6\n"
                "row_loop:\n"
                "    lbu  s3, 0(t0)          # load this row's 5-bit pixel pattern\n"
                "    li   s5, 0              # vertical scale repeat 0..3\n"
                "yloop:\n"
                "    # rowbase = s0 + (row*4 + yrep) * 128\n"
                "    slli t1, s2, 2          # row*4\n"
                "    add  t1, t1, s5         # row*4 + yrep\n"
                "    slli t1, t1, 7          # *128\n"
                "    add  t1, t1, s0         # rowbase\n"
                "\n"
                "    li   s4, 0              # column index 0..4\n"
                "cloop:\n"
                "    srl  t2, s3, s4         # shift bit into LSB\n"
                "    andi t2, t2, 1\n"
                "    beq  t2, zero, skip\n"
                "    li   t3, -1             # 0xFFFFFFFF -> four white pixels\n"
                "    slli t4, s4, 2          # col*4\n"
                "    add  t4, t1, t4\n"
                "    sw   t3, 0(t4)          # write 4 white bytes\n"
                "skip:\n"
                "    addi s4, s4, 1\n"
                "    li   t5, 5\n"
                "    blt  s4, t5, cloop\n"
                "\n"
                "    addi s5, s5, 1\n"
                "    li   t5, 4\n"
                "    blt  s5, t5, yloop\n"
                "\n"
                "    addi t0, t0, 1          # advance to the next font byte\n"
                "    addi s2, s2, 1\n"
                "    li   t5, 7\n"
                "    blt  s2, t5, row_loop\n"
                "\n"
                "    addi s0, s0, 21         # next letter: 5 columns * scale 4\n"
                "    addi s1, s1, 1\n"
                "    li   t5, 5\n"
                "    blt  s1, t5, letter_loop\n"
                "\n"
                "    li   a7, 10             # exit\n"
                "    ecall"
            ))
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


def delete_user_code(token, name):
    import json
    with sqlite3.connect(DB) as conn:
        row = conn.execute("SELECT saved_codes FROM users WHERE token = ?", (token,)).fetchone()
        if not row:
            return False
        try:
            codes = json.loads(row[0] or "[]")
        except Exception:
            codes = []
        new_codes = [c for c in codes if c.get("name") != name]
        conn.execute("UPDATE users SET saved_codes = ? WHERE token = ?", (json.dumps(new_codes), token))
        conn.commit()
        return True


def get_all_examples():
    with sqlite3.connect(DB) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT id, category, title, description FROM code_examples ORDER BY category, title").fetchall()
        return [dict(r) for r in rows]


def get_example_by_id(example_id: str):
    with sqlite3.connect(DB) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("SELECT id, category, title, description, source FROM code_examples WHERE id = ?", (example_id,)).fetchone()
        return dict(row) if row else None



