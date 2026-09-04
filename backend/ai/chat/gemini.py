import json
import os
import sys

from google import genai
from google.genai import types

from config import GEMINI_API_KEY, GEMINI_MODEL as MODEL
from chat.prompt import SYSTEM_PROMPT

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

_mcp_server_path = os.path.join(os.path.dirname(__file__), "..", "mcp_server.py")
_client = None

def _get_client():
    global _client
    if _client is None:
        if not GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY env var is not set")
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client

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

async def chat(messages: list[dict], source: str, session_id: str) -> tuple[str, list[dict]]:
    contents = _to_gemini_contents(messages)
    tools_used = []

    env = dict(os.environ)
    if session_id:
        env["MONOC_SESSION_ID"] = session_id

    server_params = StdioServerParameters(
        command=sys.executable,
        args=[_mcp_server_path],
        env=env
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            tools_response = await session.list_tools()
            
            gemini_funcs = []
            for t in tools_response.tools:
                gemini_funcs.append(types.FunctionDeclaration(
                    name=t.name,
                    description=t.description,
                    parameters_json_schema=t.inputSchema
                ))
            
            gemini_funcs.append(types.FunctionDeclaration(
                name="get_source",
                description="Get the assembly source code currently loaded in the emulator.",
                parameters_json_schema={"type": "object", "properties": {}},
            ))

            config = types.GenerateContentConfig(
                tools=[types.Tool(function_declarations=gemini_funcs)],
                system_instruction=SYSTEM_PROMPT,
            )

            client = _get_client()
            while True:
                response = await client.aio.models.generate_content(
                    model=MODEL,
                    contents=contents,
                    config=config,
                )

                if not response.function_calls:
                    return response.text, tools_used

                contents.append(response.candidates[0].content)

                parts = []
                for call in response.function_calls:
                    print(f"[tool called: {call.name}]")
                    tools_used.append(call.name)

                    if call.name == "get_source":
                        result_str = json.dumps({"source": source})
                    else:
                        # call.args is typically a dict
                        mcp_result = await session.call_tool(call.name, call.args)
                        result_str = mcp_result.content[0].text if mcp_result.content else "{}"

                    parts.append(
                        types.Part(function_response=types.FunctionResponse(
                            name=call.name,
                            response={"result": result_str},
                        ))
                    )
                contents.append(types.Content(role="user", parts=parts))
