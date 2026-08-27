
# MonoC Model Context Protocol Server

The MonoC AI assistant connects to the CPU emulator using the Model Context Protocol (`FastMCP`). Which allows the LLM to securely access the emulator's state and context. 
- All of the tools are strictly **`READ ONLY`**, AI is not allowed to modify cpu state or code editor by design. 
- Current [System Prompt](system_prompt.md).

## Supported Tools

### `get_source`
- **Description:** Get the assembly source code currently loaded in the emulator's editor.
- **Implementation:** Integrated directly into the AI router for efficiency, allowing the AI to read your code on demand.

### `read_registers`
- **Description:** Read all 32 CPU registers (x0-x31) and the Program Counter (PC).
- **Implementation:** Calls the C++ backend REST API (`GET /cpu/registers`) to get the live, cycle-accurate state of the emulator.

### `get_ui_guide`
- **Description:** Get the documentation for the MonoC Emulator UI.
- **Implementation:** Reads the local `ui-guide.md` file, allowing the AI to answer questions about how to use the web interface.

> Resource tools such as `get_isa`, `monoc_docs` were not implemented as tools. Instead integrated in System Prompt to maintain consistency (especially for local llms).

## Models Guide

- **Best Performance**: `qwen3.5:9b`
- **Decent Performance**: `qwen2.5:7b`
- **Hallucination Prone**: `gemma4:e4b`, `qwen2.5:1.5b`