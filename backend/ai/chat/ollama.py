import json
import os
import sys

from ollama import AsyncClient

from config import OLLAMA_MODEL as MODEL, OLLAMA_HOST
from chat.prompt import SYSTEM_PROMPT

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

_mcp_server_path = os.path.join(os.path.dirname(__file__), "..", "mcp_server.py")

def _numbered(source: str) -> str:
    return "\n".join(f"{i+1:3d} | {line}" for i, line in enumerate(source.split("\n")))

# if OLLAMA_HOST is set, connect to a remote ollama instance
_ollama_kwargs = {"host": OLLAMA_HOST} if OLLAMA_HOST else {}

async def chat(messages: list[dict], source: str, session_id: str):
    # check ollama availability before starting mcp server
    client = AsyncClient(**_ollama_kwargs)
    try:
        await client.list()
    except Exception as e:
        raise RuntimeError(f"Ollama server unreachable: {e}")

    if not messages or messages[0].get("role") != "system":
        messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

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
            
            # 1. discover tools dynamically from MCP server
            tools_response = await session.list_tools()
            
            # 2. map MCP tools to Ollama Tool format
            ollama_tools = []
            for t in tools_response.tools:
                props = t.inputSchema.get("properties", {})
                req = t.inputSchema.get("required", [])
                ollama_tools.append({
                    "type": "function",
                    "function": {
                        "name": t.name,
                        "description": t.description,
                        "parameters": {
                            "type": "object",
                            "properties": props,
                            "required": req
                        }
                    }
                })
            
            # 3. add get_source local tool
            ollama_tools.append({
                "type": "function",
                "function": {
                    "name": "get_source",
                    "description": "Get the assembly source code currently loaded in the emulator",
                    "parameters": {"type": "object", "properties": {}},
                },
            })

            # 4. enter AI chat loop
            client = AsyncClient(**_ollama_kwargs)
            while True:
                response = await client.chat(
                    model=MODEL,
                    messages=messages,
                    tools=ollama_tools,
                )

                if not response.message.tool_calls:
                    return response.message.content, tools_used

                messages.append(response.message)
                for call in response.message.tool_calls:
                    print(f"[tool called: {call.function.name}]")
                    tools_used.append(call.function.name)

                    if call.function.name == "get_source":
                        result_text = json.dumps({"source": _numbered(source)})
                    else:
                        mcp_result = await session.call_tool(call.function.name, call.function.arguments)
                        result_text = mcp_result.content[0].text if mcp_result.content else "{}"
                        
                    messages.append({"role": "tool", "content": result_text})
