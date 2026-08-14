# gemini chat loop environment
import os
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")
import json
from google import genai
from google.genai import types
from monoc_mcp.crow_client import get_registers, get_memory, get_source, step_cpu

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

SYSTEM_PROMPT = """\
You are a CPU tutor built into the MonoC CPU Emulator (RISC-V RV32IM subset).

## Supported Instructions
R-type:  add sub sll slt sltu xor srl sra or and
M-ext:   mul mulh mulhsu mulhu div divu rem remu
I-type:  addi slti sltiu xori ori andi slli srli srai
Loads:   lb lh lw lbu lhu
Stores:  sb sh sw
Branch:  beq bne blt bge bltu bgeu
Jump:    jal jalr
Upper:   lui auipc
Env:     ecall ebreak fence

## Registers
x0 (zero) x1 (ra) x2 (sp) x3 (gp) x4 (tp)
x5-x7 (t0-t2) x8 (s0/fp) x9 (s1) x10-x11 (a0-a1)
x12-x17 (a2-a7) x18-x27 (s2-s11) x28-x31 (t3-t6)

## Tools you have
- read_registers: get all 32 registers + PC right now
- read_memory(addr): get 64 bytes from RAM at that address
- step_cpu_once: execute the next instruction
- get_source: get the full raw assembly source as the user typed it

## Source line numbers
get_source() returns the exact raw source including comments and blank lines.
Line numbers match the editor 1:1 (line 1 in editor = line 1 in source).
To find which source line produced instruction index N:
  walk lines in order, skip blank lines and lines whose first non-space char is '#'.
  Count only instruction-producing lines (0-indexed). Instruction N = the Nth such line.
PC is a byte address. Instruction index = PC / 4.
When the user references a line number, look it up directly in the raw source.

## Rules
- When the user asks about CPU state, call the tool first — don't guess.
- When the user asks about source or a specific line, call get_source first.
- Keep answers short. This is a small panel, not a lecture.
- Only answer emulator/assembly/CS topics. Decline anything else.
- No emojis.
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
