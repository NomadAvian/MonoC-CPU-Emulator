# ai orchestrator: ollama function-calling client that talks to the crow server

import json
import ollama
from monoc_mcp.mcp_server import get_crow_greeting

MODEL = "bjoernb/gemma4-e4b-think:latest"

tools = [{
    "type": "function",
    "function": {
        "name": "get_crow_greeting",
        "description": "Fetch the greeting message currently served by the Crow C++ backend server.",
        "parameters": {"type": "object", "properties": {}},
    },
}]

USER_QUERY = "What does my greeting say?"

# --- turn 1: model decides to call the tool ---
response = ollama.chat(
    model=MODEL,
    messages=[{"role": "user", "content": USER_QUERY}],
    tools=tools,
)

if response.message.tool_calls:
    call = response.message.tool_calls[0]
    result = get_crow_greeting()
    print(f"[tool called: {call.function.name}] crow returned: {result!r}")

    # --- turn 2: feed result back, get final answer ---
    final = ollama.chat(
        model=MODEL,
        messages=[
            {"role": "user",    "content": USER_QUERY},
            response.message,   # model turn with tool_call intact
            {"role": "tool",    "content": json.dumps({"result": result})},
        ],
        tools=tools,
    )
    print(final.message.content)
else:
    print(response.message.content)
