#!/usr/bin/env bash
set -e

MISSING=0

echo "Checking prerequisites..."
echo ""

# --- Check Python 3.12+ ---
if command -v python3 &>/dev/null; then
  PY_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
  PY_MAJOR=$(echo "$PY_VERSION" | cut -d. -f1)
  PY_MINOR=$(echo "$PY_VERSION" | cut -d. -f2)
  if [ "$PY_MAJOR" -lt 3 ] || { [ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 12 ]; }; then
    echo "  ✗ Python 3.12+ required (found $PY_VERSION)"
    echo "    https://www.python.org/downloads/"
    MISSING=1
  else
    echo "  ✓ Python $PY_VERSION"
  fi
else
  echo "  ✗ python3 not found"
  echo "    https://www.python.org/downloads/"
  MISSING=1
fi

# --- Check uv ---
if command -v uv &>/dev/null; then
  echo "  ✓ uv $(uv --version 2>/dev/null)"
else
  echo "  ✗ uv not found"
  echo "    https://docs.astral.sh/uv/getting-started/installation/"
  MISSING=1
fi

# --- Check bun ---
if command -v bun &>/dev/null; then
  echo "  ✓ bun $(bun --version 2>/dev/null)"
else
  echo "  ✗ bun not found"
  echo "    https://bun.sh/docs/installation"
  MISSING=1
fi

echo ""

if [ "$MISSING" -ne 0 ]; then
  echo "Please install the missing prerequisites above, then re-run this script."
  exit 1
fi

# --- Install Python dependencies (mitmproxy, aiohttp, pydantic, etc.) ---
echo "[install] Installing Python dependencies..."
uv sync

echo ""

# --- Install Node modules ---
echo "[install] Installing Node modules..."
cd ui && bun install

echo ""
echo "[install] Done."
echo ""
echo "  Build UI:  cd ui && bun run build && cd .."
echo "  Run:       ./run.sh        (production)"
echo "  Run:       ./run_dev.sh    (development, Vite HMR)"
