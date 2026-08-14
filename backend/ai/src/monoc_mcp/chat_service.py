# ai chat loop environment
import json

import ollama

from monoc_mcp.config import OLLAMA_MODEL as MODEL
from monoc_mcp.crow_client import get_memory, get_registers, get_source, step_cpu
from monoc_mcp.prompt import SYSTEM_PROMPT

TOOLS = [
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

TOOL_DISPATCH = {
    "read_memory": get_memory,
    "read_registers": get_registers,
    "step_cpu_once": step_cpu,
    "get_source": get_source,
    # todo: get_instructions
}


def execute_tool(tool_call):
    function_name = tool_call.function.name
    fn = TOOL_DISPATCH[function_name]
    result = fn(**tool_call.function.arguments)  # ** unpacks keyword arguements
    return json.dumps(result)



def chat(messages):
    if not messages or messages[0].get("role") != "system":
        messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

    while True:
        response = ollama.chat(
            model=MODEL,
            messages=messages,
            tools=TOOLS,
        )

        if not response.message.tool_calls:
            return response.message.content

        for call in response.message.tool_calls:
            result = execute_tool(call)
            print(f"[tool called: {call.function.name}] returned: {result[:80]}...")
            messages.append(response.message)
            messages.append({"role": "tool", "content": result})
