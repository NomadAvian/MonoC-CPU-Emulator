from mcp.server.fastmcp import FastMCP
from .crow_client import get_greeting

mcp = FastMCP("monoc_mcp")

@mcp.tool()
def get_crow_greeting() -> str:
    """Fetch the greeting message currently served by the crow backend"""
    return get_greeting()
