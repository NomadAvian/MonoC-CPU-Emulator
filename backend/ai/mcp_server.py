from mcp.server.fastmcp import FastMCP
import httpx
from config import CROW_BASE_URL as CROW_BASE

mcp = FastMCP("MonoC-CPU")

@mcp.tool()
def read_registers() -> str:
    """Read all 32 cpu registers and the program counter."""
    res = httpx.get(f"{CROW_BASE}/cpu/registers", timeout=5)
    return res.text

@mcp.tool()
def read_memory(addr: str) -> str:
    """Read 64 bytes of RAM at the given address."""
    res = httpx.get(f"{CROW_BASE}/cpu/memory/{addr}", timeout=5)
    return res.text

if __name__ == "__main__":
    mcp.run()
