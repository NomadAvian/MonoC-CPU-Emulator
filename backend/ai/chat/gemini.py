import json
from google import genai
from google.genai import types
from config import GEMINI_API_KEY, GEMINI_MODEL as MODEL
from chat.prompt import SYSTEM_PROMPT
from chat.tools import GEMINI_TOOLS as TOOLS, TOOL_DISPATCH

_client = None

def _get_client():
    global _client
    if _client is None:
        if not GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY env var is not set")
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client

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


def _execute_tool_calls(function_calls, source: str) -> list[types.Part]:
    parts = []
    for call in function_calls:
        try:
            if call.name == "get_source":
                result = {"source": source}
            else:
                fn = TOOL_DISPATCH[call.name]
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

def chat(messages: list[dict], source: str) -> str:
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
        fn_parts = _execute_tool_calls(response.function_calls, source)
        contents.append(types.Content(role="user", parts=fn_parts))
