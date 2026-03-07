# Desktop App — Agent Guide

## Gotchas

- **Sidecar basename**: `sidecar()` call takes ONLY `"orthrus-backend"` (basename), NOT the full `externalBin` path. Same for `shell:allow-spawn` capability `name` field.
- **Binary validation**: Tauri validates sidecar binary existence at `cargo build` time. Needs a placeholder at `binaries/orthrus-backend-aarch64-apple-darwin` for `cargo check` to pass.
- **No `.unwrap()` / `.expect()`**: In Tauri's `setup` callback, these cause `abort()` crashes on macOS. Use `match` with `eprintln!` instead.
- **`objc2-app-kit`**: Use this crate for macOS native APIs (NOT the deprecated `cocoa` crate). Features: `NSColor`, `NSWindow`, `NSResponder`, `NSView`.
- **`ns_window()`**: Works with just `#[cfg(target_os = "macos")]`. The `macos-private-api` flag is only needed for full window `transparent: true`.
- **Writable mocks dir**: PyInstaller `--onefile` runs from a read-only temp dir. Sidecar receives `--mocks-dir ~/Library/Application Support/com.teszerrakt.orthrus/mocks`.
- **CORS required**: In production, frontend is served from `tauri://localhost`, so requests to `http://localhost:29000` are cross-origin.
- **Startup time**: Sidecar takes ~12s to start. Frontend retries config fetch every 2s (15 max attempts), shows spinner.
- **Gatekeeper**: macOS quarantine can block `.app`. Use `xattr -cr` on the bundle if needed.

## Building the sidecar

```bash
./scripts/build_backend.sh    # PyInstaller → packages/desktop/binaries/ (35MB, aarch64)
```
