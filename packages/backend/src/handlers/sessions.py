from __future__ import annotations

import json

from aiohttp import web

from src.session_manager import SessionManager


async def sessions_handler(request: web.Request) -> web.Response:
    """
    GET /sessions

    Returns a JSON array of all active/completed session summaries,
    matching the SessionInfo model (mirrors Chrome DevTools Network tab entries).
    """
    session_manager: SessionManager = request.app["session_manager"]
    infos = session_manager.all_infos()
    payload = [info.model_dump() for info in infos]
    return web.json_response(payload)


async def clear_sessions_handler(request: web.Request) -> web.Response:
    """
    DELETE /sessions

    Clears all sessions and broadcasts sessions_cleared to all WS clients.
    """
    session_manager: SessionManager = request.app["session_manager"]
    session_manager.clear_all()

    # Broadcast to all connected WebSocket clients
    ws_clients: set[web.WebSocketResponse] = request.app["ws_clients"]
    msg = json.dumps({"type": "sessions_cleared"})
    dead: list[web.WebSocketResponse] = []
    for ws in ws_clients:
        try:
            await ws.send_str(msg)
        except Exception:
            dead.append(ws)
    for ws in dead:
        ws_clients.discard(ws)

    return web.json_response({"status": "cleared"})
