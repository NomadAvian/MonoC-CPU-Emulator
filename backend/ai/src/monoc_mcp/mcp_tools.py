from google.genai import types
from monoc_mcp.crow_client import get_registers, get_memory, step_cpu

# ----------------- OLLAMA TOOLS -----------------
OLLAMA_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "read_registers",
            "description": "Read all 32 cpu registers and the program counter",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "read_memory",
            "description": "Read 64 bytes of RAM at the given address",
            "parameters": {
                "type": "object",
                "properties": {
                    "addr": {
                        "type": "string",
                        "description": "Memory address (hex or decimal)",
                    }
                },
                "required": ["addr"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "step_cpu_once",
            "description": "Execute one instruction on the CPU and return the new program counter (PC) and whether the CPU halted",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_source",
            "description": "Get the assembly source code currently loaded in the emulator",
            "parameters": {"type": "object", "properties": {}},
        },
    },
]

# ----------------- GEMINI TOOLS -----------------
GEMINI_TOOLS = types.Tool(function_declarations=[
    types.FunctionDeclaration(
        name="read_registers",
        description="Read all 32 CPU registers and the program counter.",
        parameters_json_schema={"type": "object", "properties": {}},
    ),
    types.FunctionDeclaration(
        name="read_memory",
        description="Read 64 bytes of RAM at the given address.",
        parameters_json_schema={
            "type": "object",
            "properties": {
                "addr": {
                    "type": "string",
                    "description": "Memory address (hex or decimal)",
                }
            },
            "required": ["addr"],
        },
    ),
    types.FunctionDeclaration(
        name="step_cpu_once",
        description="Execute one instruction on the CPU and return the new program counter (PC) and whether the CPU halted.",
        parameters_json_schema={"type": "object", "properties": {}},
    ),
    types.FunctionDeclaration(
        name="get_source",
        description="Get the assembly source code currently loaded in the emulator.",
        parameters_json_schema={"type": "object", "properties": {}},
    ),
])

# ----------------- DISPATCHER -----------------
TOOL_DISPATCH = {
    "read_registers": get_registers,
    "read_memory":    get_memory,
    "step_cpu_once":  step_cpu,
    # todo: get_instructions 
}
