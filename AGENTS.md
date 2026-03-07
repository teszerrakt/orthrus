# Orthrus — Agent Guide

## Project Overview

Orthrus is a **mitmproxy-based SSE event debugger**. It intercepts HTTP traffic, captures Server-Sent Events, and provides a browser UI + native macOS desktop app for inspecting, replaying, and mocking SSE streams.

**Architecture:**
```
Mobile/Browser → mitmproxy :28080 → relay server :29000 ↔ WebSocket ↔ Browser UI / Tauri Desktop App
```

**Monorepo structure (bun workspace):**
```
orthrus/
├── packages/backend/     # Python — aiohttp relay server + mitmproxy addon
├── packages/web/         # React — browser UI (also embedded in desktop app)
├── packages/desktop/     # Tauri v2 — native macOS app wrapping web + sidecar backend
├── scripts/              # Shell scripts for dev, build, install
├── config.json           # SSE patterns + relay config (shared by addon + config handler)
└── package.json          # Bun workspace root with all orchestration scripts
```

---

## Setup

```bash
bun run install:all       # installs uv deps + bun deps for all packages
```

---

## Bun Scripts (run from repo root)

All commands use the `bun run <script>` pattern. Specific packages are suffixed: `:web`, `:backend`, `:desktop`.

| Command              | Description                                              |
|----------------------|----------------------------------------------------------|
| `bun run dev:web`    | Relay server + mitmproxy + Vite dev server (web mode)    |
| `bun run dev:desktop`| Relay server + mitmproxy + Tauri dev (desktop mode)      |
| `bun run start:web`  | Relay server + mitmproxy + pre-built UI (production)     |

> **Note:** The web linter is `oxlint` (not ESLint) and the formatter is `oxfmt` (not Prettier).

---

## Environment Variables

| Variable     | Default      | Description                          |
|--------------|--------------|--------------------------------------|
| `RELAY_PORT` | `29000`      | aiohttp relay server port            |
| `PROXY_PORT` | `28080`      | mitmproxy intercept port             |
| `MOCKS_DIR`  | `./mocks`    | Directory for mock JSON response files |

---

## Code Style

### Python (backend)
- `from __future__ import annotations` as first import in every file
- Modern type syntax: `str | None`, `dict[str, str]`, `list[SSEEvent]`
- Pydantic models use `ConfigDict(frozen=True)` and discriminated unions
- See `packages/backend/AGENTS.md` for gotchas

### TypeScript / React (web)
- Linter is `oxlint`, formatter is `oxfmt` (NOT ESLint/Prettier)
- `verbatimModuleSyntax` + `erasableSyntaxOnly` enabled
- Tailwind CSS v4 with CSS custom properties for design tokens
- See `packages/web/AGENTS.md` for Tauri-specific gotchas

### Rust (desktop)
- Use `objc2-app-kit` (not deprecated `cocoa` crate) for macOS APIs
- Never `.unwrap()` / `.expect()` in Tauri setup (causes `abort()` crash)
- See `packages/desktop/AGENTS.md` for sidecar gotchas
