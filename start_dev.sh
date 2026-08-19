#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR"
BUILD_DIR="$ROOT/build"

trap 'kill 0' EXIT

echo "[setup] Starting frontend..."
(cd "$ROOT/frontend" && npm run dev) &

echo "[setup] Starting Crow..."
(cd "$BUILD_DIR" && ./crow_server) &

echo "[setup] Starting Python server..."
(cd "$ROOT/backend/ai/src" && uv run uvicorn monoc_mcp.api:app --reload --port 8000) &

wait
