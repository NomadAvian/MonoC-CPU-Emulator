# MonoC

A 32-bit RISC-V CPU Emulator and Assembler.

Currenlty, it supports the base and the M-extension instructions.

## Dependencies

You need to have the following installed:
1. `uv`: Python package/project manager (handles the AI backend's dependencies):
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```
2. `crow`: C++ HTTP micro-framework for the backend server. Install it system-wide so the Makefile can find the headers:
   - macOS (Homebrew): `brew install crow`
   - Linux: `.deb` file from the main repo
3. `npm`: Node.js package manager (ships with Node.js; used for the frontend)

4. `.env`: copy `backend/.env.example` to `backend/ai/.env` and set `OLLAMA_MODEL` to your pulled model (e.g. `qwen3:0.6b`). `GEMINI_API_KEY` is only needed for the Gemini fallback. 

5. `ollama` (optional): local LLM runtime. Install from https://ollama.com, then pull a model, e.g.:
   ```bash
   ollama pull gemma4:e4b
   ```

## Build

```bash
make # build the emulator / crow server
./start_monoc.sh # start the web app
```