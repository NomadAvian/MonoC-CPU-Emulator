#!/usr/bin/env bash
# crow-gemini-mcp test — starts crow server, runs gemini orchestrator, then kills server
set -e
set -a; source .env; set +a  # auto-export all vars from .env to subprocesses

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR/../.."
BUILD_DIR="$ROOT/build"
AI_DIR="$ROOT/ai"

mkdir -p "$BUILD_DIR"

echo "[test] Cleaning old server..."
pkill -f "crow_server" 2>/dev/null || true
kill "$(lsof -ti :6969)" 2>/dev/null || true


echo "[test] Building Crow server..."
g++ "$ROOT/backend/main.cpp" \
    -std=c++20 \
    -I/opt/homebrew/include \
    -pthread \
    -o "$BUILD_DIR/crow_server"

"$BUILD_DIR/crow_server" &
SERVER_PID=$!

trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT #if something breaks kill this instance

echo "[test] Crow started (PID $SERVER_PID)"
for i in $(seq 1 20); do
    if RESULT=$(curl -sf http://localhost:6969/); then
        break
    fi
    sleep 0.5
done

echo "[test] Crow says: $RESULT"
cd "$AI_DIR"
uv run python src/monoc_mcp/gemini.py
