from mcp.server.fastmcp import FastMCP
import httpx
from config import CROW_BASE_URL as CROW_BASE

mcp = FastMCP("MonoC-CPU")

# get_source has been integrated inside the sdk of ai models for efficiency

import os

@mcp.tool()
def read_registers() -> str:
    """Read all 32 cpu registers and the program counter."""
    session_id = os.environ.get("MONOC_SESSION_ID", "")
    headers = {"X-Session-Id": session_id} if session_id else {}
    res = httpx.get(f"{CROW_BASE}/cpu/registers", headers=headers, timeout=5)
    return res.text

@mcp.tool()
def get_ui_guide() -> str:
    """Get the documentation for the MonoC Emulator UI."""
    import pathlib
    # easy path for ai & docker
    docs_path = pathlib.Path(__file__).parent / "ui-guide.md"
    try:
        return docs_path.read_text()
    except Exception as e:
        return f"Error reading UI guide: {e}"

if __name__ == "__main__":
    mcp.run()
