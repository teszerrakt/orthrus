# Web Frontend — Agent Guide

## Gotchas

- **`apiFetch()`**: All backend requests MUST use `apiFetch()` from `utils/api.ts` (NOT raw `fetch()`). In Tauri mode it prepends `http://localhost:29000`, in browser mode it uses relative paths.
- **Tauri detection**: Use `isTauri()` from `@tauri-apps/api/core`. Do NOT check `window.__TAURI__` (doesn't exist by default in Tauri v2).
- **Window dragging**: Use programmatic `getCurrentWindow().startDragging()` on mousedown. Do NOT use `data-tauri-drag-region` HTML attribute (broken in Tauri v2 WebKit).
- **Fullscreen detection**: `document.fullscreenchange` does NOT fire in Tauri/WebKit on macOS. Use Tauri's `getCurrentWindow().onResized()` + `isFullscreen()`. Delay on-detection by 500ms for macOS animation.
- **React StrictMode**: Causes double WebSocket connections — guarded with `connectingRef` in `useWebSocket`.
- **Linter/Formatter**: Uses `oxlint` and `oxfmt` (NOT ESLint/Prettier).
- **Cert badge**: 3-state per device group — yellow (TLS error from that device), green (cert installed via `/cert/status`), gray (not installed). Always visible.

## Code Style

- Functional components only, named exports (`App` is the only default export)
- `import type` for type-only imports (`verbatimModuleSyntax`)
- No `const enum`, namespaces, or decorators (`erasableSyntaxOnly`)
- Tailwind CSS v4 utilities + CSS custom properties in `index.css`: `--bg`, `--bg-panel`, `--border`, `--text`, `--accent`, `--success`, `--warning`, `--danger`
- No `any` — prefer `unknown` + type narrowing
