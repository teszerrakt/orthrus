#!/usr/bin/env bash
set -e

RELAY_PORT="${RELAY_PORT:-29000}"
PROXY_PORT="${PROXY_PORT:-28080}"
MOCKS_DIR="${MOCKS_DIR:-./mocks}"

UI_HASH_FILE="ui/dist/.build_hash"
CURRENT_HASH=$(find ui/src ui/index.html ui/package.json ui/bun.lock ui/vite.config.ts ui/tsconfig*.json \
  -type f 2>/dev/null | sort | xargs cat | shasum -a 256 | cut -d' ' -f1)

if [ -f "$UI_HASH_FILE" ] && [ "$(cat "$UI_HASH_FILE")" = "$CURRENT_HASH" ]; then
  echo "[run.sh] UI build is up to date, skipping build"
else
  echo "[run.sh] Building UI..."
  (cd ui && bun run build)
  mkdir -p "ui/dist"
  printf '%s\n' "$CURRENT_HASH" > "$UI_HASH_FILE"
fi

# Detect the machine's LAN IP (the address other devices can reach us on)
LAN_IP=$(uv run python -c "
import socket
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(('8.8.8.8', 80))
    print(s.getsockname()[0])
    s.close()
except Exception:
    print('localhost')
" 2>/dev/null || echo "localhost")

echo "[run.sh] Starting relay server on :${RELAY_PORT}"
uv run python relay_server.py --port "$RELAY_PORT" --mocks-dir "$MOCKS_DIR" &
RELAY_PID=$!

sleep 1  # give relay a moment to bind

echo "[run.sh] Starting mitmproxy on :${PROXY_PORT}"
uv run mitmdump \
  --listen-port "$PROXY_PORT" \
  --scripts addon.py \
  --ssl-insecure \
  "$@" &
MITM_PID=$!

cleanup() {
  echo "[run.sh] Shutting down..."
  kill "$RELAY_PID" "$MITM_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo ""
echo "  Relay:    http://${LAN_IP}:${RELAY_PORT}"
echo "  Proxy:    ${LAN_IP}:${PROXY_PORT}  (set as WiFi proxy on device)"
echo "  UI:       http://${LAN_IP}:${RELAY_PORT}"
echo ""

wait
