#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR"
BUILD_DIR="$ROOT/build"
STOP_FILE="/tmp/monoc_stop_$$"
rm -f "$STOP_FILE"

cleanup() {
    touch "$STOP_FILE" 2>/dev/null
    echo ""
    echo "[shutdown] Stopping all services..."
    trap - SIGINT SIGTERM EXIT
    kill 0 2>/dev/null
    wait 2>/dev/null
    rm -f "$STOP_FILE" 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

run_with_restart() {
    local name="$1"
    shift
    while [ ! -f "$STOP_FILE" ]; do
        echo "[setup] Starting $name..."
        set +e
        "$@"
        local exit_code=$?
        set -e
        if [ -f "$STOP_FILE" ] || [ "$exit_code" -eq 130 ] || [ "$exit_code" -eq 143 ] || [ "$exit_code" -eq 2 ] || [ "$exit_code" -eq 15 ]; then
            break
        fi
        echo "[warning] $name exited/crashed with code $exit_code. Restarting in 1s..."
        sleep 1 || break
    done
}

run_with_restart "Crow server" bash -c "cd '$BUILD_DIR' && ./crow_server" &
run_with_restart "Frontend" bash -c "cd '$ROOT/frontend' && npm run dev" &
run_with_restart "MCP server" bash -c "cd '$ROOT/backend/ai' && uv run uvicorn main:app --reload --port 8000" &

echo "[check] Ollama installation..."
if command -v ollama &> /dev/null; then
    run_with_restart "Ollama" ollama serve &
else
    echo "[check] Ollama is not installed, skipping Ollama"
fi

wait