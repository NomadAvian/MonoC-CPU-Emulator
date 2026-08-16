import json
from google import genai
from google.genai import types
from monoc_mcp.config import GEMINI_API_KEY, GEMINI_MODEL as MODEL
from monoc_mcp.crow_client import get_registers, get_memory, get_source, step_cpu
from monoc_mcp.prompt import SYSTEM_PROMPT

_client = None

def _get_client():
    global _client
    if _client is None:
        if not GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY env var is not set")
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client

TOOLS = types.Tool(function_declarations=[
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

TOOL_DISPATCH = {
    "read_registers": get_registers,
    "read_memory":    get_memory,
    "step_cpu_once":  step_cpu,
    "get_source":     get_source,
    # todo: get_instructions 
}

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
