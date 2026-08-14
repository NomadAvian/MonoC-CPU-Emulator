# ai chat loop environment
import json

import ollama

from monoc_mcp.crow_client import get_memory, get_registers, get_source, step_cpu

MODEL = "bjoernb/gemma4-e4b-think:latest"

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
    "read_memory":    get_memory,
    "read_registers": get_registers,
    "step_cpu_once":  step_cpu,
    "get_source":     get_source,
    # todo: get_instructions
}


def execute_tool(tool_call):
    function_name = tool_call.function.name
    fn = TOOL_DISPATCH[function_name]
    result = fn(**tool_call.function.arguments)  # ** unpacks keyword arguements
    return json.dumps(result)


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
