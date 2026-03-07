# Backend — Agent Guide

## Gotchas

- **Original method passthrough**: `addon.py` rewrites all intercepted requests to `POST /relay?target=<url>&method=<original_method>`. The relay extracts `method` from the query param so upstream endpoints receive the correct HTTP method (usually `GET`).
- **CORS middleware**: Backend sends `Access-Control-Allow-Origin: *` because Tauri production serves from `tauri://localhost` origin.
- **Sidecar mode**: `orthrus_main.py` runs both aiohttp relay and mitmproxy `DumpMaster` on a shared asyncio event loop. Takes `--mocks-dir` flag because PyInstaller `--onefile` runs from a read-only temp dir.
- **Config path**: `config.py` resolves `_PROJECT_ROOT` via `Path(__file__).parents[4]` to reach repo root. If file structure changes, this breaks.
- **Cert detection**: `security find-certificate` on macOS requires positional keychain arg (not `-k` flag) and `-c "mitmproxy"` filter for reliable SHA-1 output.

## Code Style

- `from __future__ import annotations` as the **first import** in every file
- Annotate **all** function parameters and return types
- Pydantic models: `model_config = ConfigDict(frozen=True)`, discriminated unions with `Annotated[Union[A, B], Field(discriminator="type")]`
- `logger = logging.getLogger(__name__)` — one per module, at module level
- No bare `except:` — catch specific exception types
- `asyncio.create_task()` for fire-and-forget coroutines

## Tests

Tests are in `tests/unit/` and `tests/integration/`. Integration tests use `aiohttp.test_utils.TestClient` via fixtures in `tests/integration/conftest.py`.

```bash
bun run test:backend              # all (25)
bun run test:backend:unit         # unit (12)
bun run test:backend:integration  # integration (13)
```
