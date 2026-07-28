#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR/../.."
BUILD_DIR="$ROOT/build"
AI_DIR="$ROOT/backend/ai"

mkdir -p "$BUILD_DIR"

echo "[test] Killing old server..."
pkill -f crow_server 2>/dev/null || true
kill "$(lsof -ti :6969)" 2>/dev/null || true

echo "[test] Building..."
g++ "$ROOT/backend/main.cpp" \
    -std=c++20 \
    -I/opt/homebrew/include \
    -pthread \
    -o "$BUILD_DIR/crow_server"

echo "[test] Starting Crow..."
"$BUILD_DIR/crow_server" &
SERVER_PID=$!

trap "kill $SERVER_PID" EXIT

echo "[test] Waiting for server..."
until curl -sf http://localhost:6969/ai/test >/dev/null; do
    sleep 0.5
done

echo "[test] Crow is ready."

echo "[test] Running Ollama orchestrator..."
cd "$AI_DIR"
uv run python src/monoc_mcp/ollama_model.py
