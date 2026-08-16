from mcp.server.fastmcp import FastMCP
from .crow_client import get_registers, get_memory, step_cpu as crow_step_cpu

mcp = FastMCP("monoc_mcp")

# testing tool to check the mcp server status
@mcp.tool()
def read_registers() -> dict:
    """Read all 32 cpu registers and the program counter"""
    return get_registers()

@mcp.tool()
def read_memory(addr: str) -> dict:
    # TODO what mem type?
    """Read 64 bytes of RAM at the given address. Address format """
    return get_memory(addr)

@mcp.tool()
def step_cpu() -> dict:
    """Execute one instruction on the CPU and return the new program counter (PC) and whether the CPU halted"""
    return crow_step_cpu()  # step_cpu() introduces recursion bug