from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest
from aiohttp.test_utils import TestClient


class TestRelayHandler:
    """Integration tests for POST /relay endpoint."""

    @pytest.mark.asyncio
    async def test_creates_session_with_correct_method(
        self, client: TestClient
    ) -> None:
        """POST /relay?method=GET should create session with method=GET,
        not POST (which is the transport method from the addon)."""
        target = "https://stream.wikimedia.org/v2/stream/recentchange"

        with patch("src.sse_client.stream_upstream_sse", new_callable=AsyncMock):
            resp = await client.post(
                f"/relay?target={target}&method=GET",
                headers={"user-agent": "TestAgent/1.0"},
            )
            # Should return 200 (SSE stream response)
            assert resp.status == 200
            assert resp.headers["Content-Type"] == "text/event-stream"

        # Verify session was created with correct method
        sessions_resp = await client.get("/sessions")
        sessions = await sessions_resp.json()
        assert len(sessions) == 1
        assert sessions[0]["request"]["method"] == "GET"
        assert sessions[0]["request"]["url"] == target

    @pytest.mark.asyncio
    async def test_session_preserves_put_method(self, client: TestClient) -> None:
        """Verify non-GET methods are also preserved correctly."""
        target = "https://example.com/api/stream"

        with patch("src.sse_client.stream_upstream_sse", new_callable=AsyncMock):
            resp = await client.post(
                f"/relay?target={target}&method=PUT",
                headers={"user-agent": "TestAgent/1.0"},
            )
            assert resp.status == 200

        sessions_resp = await client.get("/sessions")
        sessions = await sessions_resp.json()
        assert len(sessions) == 1
        assert sessions[0]["request"]["method"] == "PUT"

    @pytest.mark.asyncio
    async def test_sessions_list_and_clear(self, client: TestClient) -> None:
        """Create a session, list it, clear all, verify empty."""
        target = "https://example.com/sse"

        with patch("src.sse_client.stream_upstream_sse", new_callable=AsyncMock):
            await client.post(f"/relay?target={target}&method=GET")

        # List
        resp = await client.get("/sessions")
        sessions = await resp.json()
        assert len(sessions) == 1

        # Clear
        resp = await client.delete("/sessions")
        assert resp.status == 200

        # Verify empty
        resp = await client.get("/sessions")
        sessions = await resp.json()
        assert len(sessions) == 0
