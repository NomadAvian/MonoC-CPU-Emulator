# testing
1. ollama server
2. crow server on
3. this script:
```bash
uv run uvicorn monoc_mcp.api:app --reload --port 8000
 
curl -X POST http://localhost:8000/chat \
    -H "Content-Type: application/json" \
    -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
```
