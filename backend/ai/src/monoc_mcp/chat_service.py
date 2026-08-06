# ai chat loop environment
import json
import ollama
from monoc_mcp.crow_client import get_greeting, get_registers, get_memory, step_cpu

MODEL = "bjoernb/gemma4-e4b-think:latest"

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_crow_greeting",
            "description": "Fetch the greeting message currently served by the crow backend",
            "parameters": {"type": "object", "properties": {}},
        }
    },
    {
        "type": "function",
        "function": {
            "name": "read_registers",
            "description": "Read all 32 cpu registers and the program counter",
            "parameters": {"type": "object", "properties": {}},
        }
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
                        "description": "Memory address (hex or decimal)"
                    }
                },
                "required": ["addr"],
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "step_cpu_once",
            "description": "Execute one instruction on the CPU and return the new program counter (PC) and whether the CPU halted",
            "parameters": {"type": "object", "properties": {}},
        }
    },
]

TOOL_DISPATCH = {
    "get_crow_greeting": get_greeting,
    "read_memory": get_memory,
    "read_registers": get_registers,
    "step_cpu_once": step_cpu,
}


def execute_tool(tool_call):
    function_name = tool_call.function.name
    fn = TOOL_DISPATCH[function_name]
    result = fn(**tool_call.function.arguments)      # ** unpacks keyword arguements
    return json.dumps(result)



SYSTEM_PROMPT = """\
You are a helpful CPU emulator tutor built into the MonoC CPU Emulator.
You help students understand assembly code, CPU architecture, and program execution.

You have access to these tools to inspect the live CPU state:
- read_registers: Read all 32 CPU registers and the program counter
- read_memory(addr): Read 64 bytes of RAM starting at an address
- step_cpu_once: Execute one instruction and see the result

When an user asks about CPU state, USE your tools to get real data
rather than guessing. Explain things clearly and at a beginner level.
Keep responses concise — this is a small chat panel, not an essay. Strictly don't use any emojis.
"""

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
