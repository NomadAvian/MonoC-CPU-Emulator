# MonoC-CPU-Emulator AI Backend

This is the FastAPI backend that orchestrates the LLMs for the MonoC CPU Emulator. It serves as an MCP server, providing AI agents with tools to interact with the emulator.

## Architecture

```text
ai/
├── main.py          # FastAPI entry point & routes
├── config.py        # Environment variables & constants
├── db.py            # SQLite database operations
├── chat/            # LLM Services
│   ├── gemini.py    # Gemini chat loop
│   ├── ollama.py    # Ollama chat loop
│   ├── prompt.py    # System instructions
│   └── tools.py     # Tool schemas (read_registers, etc.)
└── emulator/        # Engine Communication
    └── client.py    # HTTP client to the Crow server
```

## Running the Server

To start the FastAPI server locally:

```bash
uv run uvicorn main:app --reload --port 8000
```

> Note: You can also start the entire stack using the `start_monoc.sh` script in the root of the project.

## Testing the API

You can test the `/chat` endpoint using `curl`. Note that the payload requires both the `messages` array and the `source` code string!

```bash
curl -X POST http://localhost:8000/chat \
    -H "Content-Type: application/json" \
    -d '{
          "messages": [{"role": "user", "content": "What is the value of the Program Counter?"}],
          "source": "ADDI R1, R0, 5\nHLT"
        }'
```
