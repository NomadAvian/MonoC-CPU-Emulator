import json
import os
import sys

from openai import AsyncOpenAI

from config import OMNIROUTE_MODEL as MODEL, OMNIROUTE_API_KEY, OMNIROUTE_BASE_URL
from chat.prompt import SYSTEM_PROMPT

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

_mcp_server_path = os.path.join(os.path.dirname(__file__), "..", "mcp_server.py")

def _numbered(source: str) -> str:
    return "\n".join(f"{i+1:3d} | {line}" for i, line in enumerate(source.split("\n")))

async def chat(messages: list[dict], source: str, session_id: str):
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
            
            # 2. map MCP tools to OpenAI Tool format
            openai_tools = []
            for t in tools_response.tools:
                props = t.inputSchema.get("properties", {})
                req = t.inputSchema.get("required", [])
                openai_tools.append({
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
            openai_tools.append({
                "type": "function",
                "function": {
                    "name": "get_source",
                    "description": "Get the assembly source code currently loaded in the emulator",
                    "parameters": {"type": "object", "properties": {}},
                },
            })

            # 4. enter AI chat loop
            client = AsyncOpenAI(api_key=OMNIROUTE_API_KEY, base_url=OMNIROUTE_BASE_URL)
            while True:
                response = await client.chat.completions.create(
                    model=MODEL,
                    messages=messages,
                    tools=openai_tools,
                )

                response_message = response.choices[0].message

                if not response_message.tool_calls:
                    return response_message.content, tools_used

                # Append assistant's response to conversation
                assistant_msg = {
                    "role": "assistant",
                    "content": response_message.content,
                }
                if response_message.tool_calls:
                    assistant_msg["tool_calls"] = [
                        {
                            "id": call.id,
                            "type": "function",
                            "function": {
                                "name": call.function.name,
                                "arguments": call.function.arguments
                            }
                        } for call in response_message.tool_calls
                    ]
                messages.append(assistant_msg)

                for call in response_message.tool_calls:
                    print(f"[tool called: {call.function.name}]")
                    tools_used.append(call.function.name)
                    
                    if call.function.name == "get_source":
                        result_text = json.dumps({"source": _numbered(source)})
                    else:
                        args = json.loads(call.function.arguments) if call.function.arguments else {}
                        mcp_result = await session.call_tool(call.function.name, args)
                        result_text = mcp_result.content[0].text if mcp_result.content else "{}"
                        
                    messages.append({
                        "role": "tool", 
                        "tool_call_id": call.id,
                        "content": result_text
                    })
