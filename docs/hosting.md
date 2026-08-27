# Hosting & Usage Guide

MonoC CPU Emulator is designed to be highly modular. AI is entirely optional. It can be run either natively for personal local development, or via Docker as a server that multiple users can connect to over a network.

## AI Provider Overview

Before choosing a deployment mode, pick your AI strategy and set the relevant vars in your `.env` (copied from `.env.example`):

| Provider | What it is | Required vars |
|---|---|---|
| **None** | Disable AI entirely | _(omit all AI vars)_ |
| **Gemini** | Google's cloud API | `GEMINI_API_KEY`, `GEMINI_MODEL` |
| **Ollama** | Local or remote open-weight models | `OLLAMA_HOST`, `OLLAMA_MODEL` |
| **OmniRoute** | Free-tier gateway across many cloud providers | `OMNIROUTE_API_KEY`, `OMNIROUTE_BASE_URL`, `OMNIROUTE_MODEL` |

Gemini works with **any** deployment mode below. OmniRoute works with `omni` Docker profile but can be configured manually in any mode.


## 1. Local Native (No Docker)

**Best for:** Personal usage on your own machine.

Follow the [build instructions](../README.md#build) to compile and run natively.

- Ollama is **auto-detected** if installed — set `OLLAMA_MODEL` in `.env` and you're done. No `OLLAMA_HOST` needed.
- Gemini and OmniRoute both work here — just set the relevant vars in `.env`.

---

## 2. Docker Deployment

The stack is managed via Docker Compose profiles. The core services (frontend, backend, CPU emulator, and proxy) always start. Append `--profile <name>` to use optional configurations (omni, ollama).

```bash
docker compose up -d
```

**Use when:** Don't require AI. Only want to use the CPU emulator. Equivalent to [Local Native](#local-native-no-docker) but cleaner.

#### 2.1 Ollama running natively on the same host:
---

```bash
# In your .env:
OLLAMA_HOST=http://host.docker.internal:11434
```

> **Mac note:** Docker on macOS cannot access the GPU. This is the recommended Ollama setup for Mac — run the [Ollama app](https://ollama.com) natively and point the Base Profile at it via `host.docker.internal`.

#### 2.2 Ollama running inside Docker
---

```bash
OLLAMA_HOST=http://ollama:11434
```

In this case, you do not need to start host-level Ollama with OLLAMA_HOST="0.0.0.0" because the containers communicate through the Docker network.

#### 2.3 Ollama running on a different machine (LAN or Tailscale):
---

First, on the **Ollama host machine**, start the server bound to all interfaces:

```bash
env OLLAMA_HOST="0.0.0.0" ollama serve
```

> [!WARNING]
> By default, Ollama strictly blocks all traffic that does NOT originate from `127.0.0.1`/`localhost`. Thus Ollama must be started with `env OLLAMA_HOST="0.0.0.0" ollama serve`.

Then in your `.env` on the machine running Docker:

```bash
OLLAMA_HOST=http://<host-ip>:11434
# e.g. a Tailscale address: OLLAMA_HOST=http://100.x.y.z:11434
```

> **Tip:** [Tailscale](https://tailscale.com/) is the easiest way to securely connect a cloud VPS to a home PC running Ollama without opening router ports.


## 3. Profile Based

### 3.1 Omni Profile

```bash
docker compose --profile omni up -d
```

**Use when:** You want to load-balance across 300+ free cloud AI providers without using local RAM or a paid API key.

- Spins up the OmniRoute gateway automatically and links it to the backend — no extra config needed.
- Dashboard available at `http://localhost:20128/dashboard`.
- To override the model or key, set `OMNIROUTE_MODEL` / `OMNIROUTE_API_KEY` in `.env`.

---

### 3.2 Ollama Profile

```bash
docker compose --profile ollama up -d
```

**Use when:** You want Ollama running **inside Docker**. Clean installation on devices without GPU.

- Spins up the official `ollama` container and links it to the backend automatically.
- Set `OLLAMA_MODEL` in `.env` to choose the model.
- Requires a **Linux host** with Docker GPU passthrough configured for good performance.

> **Mac warning:** Docker on macOS cannot pass through the GPU. Mac users should use the **Base Profile** and run the [Ollama app](https://ollama.com) natively instead — see [Base Profile → Ollama on same host](#ollama-running-natively-on-the-same-mac-or-windows-host) above.
