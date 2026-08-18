# ai chat loop environment
import json

import ollama

from config import OLLAMA_MODEL as MODEL
from chat.prompt import SYSTEM_PROMPT
from chat.tools import OLLAMA_TOOLS as TOOLS, TOOL_DISPATCH


def execute_tool(tool_call, source: str):
    function_name = tool_call.function.name
    if function_name == "get_source":
        result = {"source": source}
    else:
        fn = TOOL_DISPATCH[function_name]
        result = fn(**tool_call.function.arguments)  # ** unpacks keyword arguements
    return json.dumps(result)


def chat(messages: list[dict], source: str):
    if not messages or messages[0].get("role") != "system":
        messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

    tools_used = []

    while True:
        response = ollama.chat(
            model=MODEL,
            messages=messages,
            tools=TOOLS,
        )

        if not response.message.tool_calls:
            return response.message.content, tools_used

        messages.append(response.message)
        for call in response.message.tool_calls:
            result = execute_tool(call, source)
            print(f"[tool called: {call.function.name}] returned: {result[:80]}...")
            tools_used.append(call.function.name)
            messages.append({"role": "tool", "content": result})
