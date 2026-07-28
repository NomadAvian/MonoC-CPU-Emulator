# gemini orchestrator — GEMINI_API_KEY must be set in environment (sourced by test script)
import os
from google import genai
from google.genai import types

from monoc_mcp.crow_client import get_greeting

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# --- tool declaration ---
greeting_tool = types.Tool(function_declarations=[
    types.FunctionDeclaration(
        name="get_crow_greeting",
        description="Fetch the greeting message currently served by the Crow C++ backend server.",
        parameters_json_schema={"type": "object", "properties": {}},
    )
])

config = types.GenerateContentConfig(tools=[greeting_tool])

USER_QUERY = "how to greeet??"

# model decides to call the tool
response = client.models.generate_content(
    model="gemini-flash-latest",
    contents=USER_QUERY,
    config=config,
)

if response.function_calls:
    call = response.function_calls[0]
    result = get_greeting()
    print(f"[tool called: {call.name}] crow returned: {result!r}")

    # feed result back, get final answer
    # use the raw model content so thought_signature is preserved (required for thinking models)
    final = client.models.generate_content(
        model="gemini-flash-latest",
        contents=[
            types.Content(role="user", parts=[types.Part(text=USER_QUERY)]),
            response.candidates[0].content,  # preserves thought_signature
            types.Content(role="user", parts=[
                types.Part(function_response=types.FunctionResponse(
                    name=call.name, response={"result": result}
                ))
            ]),
        ],
        config=config,
    )
    print(final.text)
else:
    print(response.text)
