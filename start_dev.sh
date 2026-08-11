#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR"
BUILD_DIR="$ROOT/build"

echo "[test] Building Crow server..."
g++ "$ROOT/backend/main.cpp" \
    -std=c++20 \
    -I/opt/homebrew/include \
    -pthread \
    -o "$BUILD_DIR/crow_server"

trap 'kill 0' EXIT

echo "[setup] Starting Crow..."
(cd "$BUILD_DIR" && ./crow_server) &

echo "[setup] Starting frontend..."
(cd "$ROOT/frontend" && npm run dev) &

echo "[setup] Starting Mcp server..."
(cd "$ROOT/backend/ai/src" && uv run uvicorn monoc_mcp.api:app --reload --port 8000) &

echo "[check] Ollama is installed or not"
if command -v ollama &> /dev/null; then
    echo "[setup] Ollama model..."
    (ollama serve)
else
    echo "Ollama is not installed, skipping Ollama"
fi

wait
