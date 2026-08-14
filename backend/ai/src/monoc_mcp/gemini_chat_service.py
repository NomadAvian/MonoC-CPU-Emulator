# gemini chat loop environment
import os
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")
import json
from google import genai
from google.genai import types
from monoc_mcp.crow_client import get_greeting, get_registers, get_memory, step_cpu

MODEL = "gemini-2.5-flash"

_client = None

def _get_client():
    global _client
    if _client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY env var is not set")
        _client = genai.Client(api_key=api_key)
    return _client

TOOLS = types.Tool(function_declarations=[
    types.FunctionDeclaration(
        name="get_crow_greeting",
        description="Fetch the greeting message currently served by the Crow C++ backend server.",
        parameters_json_schema={"type": "object", "properties": {}},
    ),
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
])

TOOL_DISPATCH = {
    "get_crow_greeting": get_greeting,
    "read_registers":    get_registers,
    "read_memory":       get_memory,
    "step_cpu_once":     step_cpu,
}

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

CONFIG = types.GenerateContentConfig(
    tools=[TOOLS],
    system_instruction=SYSTEM_PROMPT,
)

# helper functions
def _to_gemini_contents(messages: list[dict]) -> list[types.Content]:
    contents = []
    for msg in messages:
        if msg["role"] == "system":
            continue
        role = "model" if msg["role"] == "assistant" else "user"
        contents.append(
            types.Content(role=role, parts=[types.Part(text=msg["content"])])
        )
    return contents


def _execute_tool_calls(function_calls) -> list[types.Part]:
    parts = []
    for call in function_calls:
        fn = TOOL_DISPATCH[call.name]
        try:
            result = fn(**call.args) if call.args else fn()
        except Exception as e:
            result = f"Error calling {call.name}: {e}"
        print(f"[tool: {call.name}] → {json.dumps(result)[:80]}…")
        parts.append(
            types.Part(function_response=types.FunctionResponse(
                name=call.name,
                response={"result": result},
            ))
        )
    return parts

def chat(messages: list[dict]) -> str:
    contents = _to_gemini_contents(messages)

    while True:
        response = _get_client().models.generate_content(
            model=MODEL,
            contents=contents,
            config=CONFIG,
        )

        if not response.function_calls:
            return response.text

        # preserve the model's response (including thought_signature)
        contents.append(response.candidates[0].content)

        # execute tools and feed results back
        fn_parts = _execute_tool_calls(response.function_calls)
        contents.append(types.Content(role="user", parts=fn_parts))
