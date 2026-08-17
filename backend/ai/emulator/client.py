# mcp server and crow server interface
# mcp server calls these functions directly from mcp_server.py

import httpx

from config import CROW_BASE_URL as CROW_BASE


def get_registers() -> dict:
    return httpx.get(f"{CROW_BASE}/cpu/registers", timeout=5).json()


def get_memory(addr: str) -> dict:
    return httpx.get(f"{CROW_BASE}/cpu/memory/{addr}", timeout=5).json()


# todo: get instruction
