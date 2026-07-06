# httpx wrapper for crow's api(s)

import httpx

CROW_BASE = "http://localhost:6969"

def get_greeting() -> str:
    """Fetch the greeting from the Crow server"""
    return httpx.get(CROW_BASE, timeout=5).text

