from __future__ import annotations

from aiohttp.test_utils import make_mocked_request

from src.handlers.relay import _build_request_info, _HOP_BY_HOP


class TestBuildRequestInfo:
    """Unit tests for _build_request_info()."""

    def test_extracts_target_and_method_from_query(self) -> None:
        request = make_mocked_request(
            "POST",
            "/relay?target=https%3A%2F%2Fexample.com%2Fsse&method=GET",
        )
        info = _build_request_info(request)
        assert info.url == "https://example.com/sse"
        assert info.method == "GET"

    def test_defaults_method_to_request_method(self) -> None:
        """When no method query param, fall back to request.method."""
        request = make_mocked_request(
            "POST",
            "/relay?target=https%3A%2F%2Fexample.com",
        )
        info = _build_request_info(request)
        assert info.method == "POST"

    def test_strips_hop_by_hop_headers(self) -> None:
        request = make_mocked_request(
            "POST",
            "/relay?target=https%3A%2F%2Fexample.com&method=GET",
            headers={
                "host": "localhost",
                "connection": "keep-alive",
                "x-original-client-ip": "10.0.0.1",
                "accept": "text/event-stream",
                "user-agent": "TestAgent/1.0",
            },
        )
        info = _build_request_info(request)
        # hop-by-hop headers removed
        for header in _HOP_BY_HOP:
            assert header not in {k.lower() for k in info.headers}
        # regular headers preserved
        assert info.headers["accept"] == "text/event-stream"

    def test_extracts_client_ip_from_header(self) -> None:
        request = make_mocked_request(
            "POST",
            "/relay?target=https%3A%2F%2Fexample.com&method=GET",
            headers={"x-original-client-ip": "192.168.1.100"},
        )
        info = _build_request_info(request)
        assert info.client_ip == "192.168.1.100"

    def test_extracts_user_agent(self) -> None:
        request = make_mocked_request(
            "POST",
            "/relay?target=https%3A%2F%2Fexample.com&method=GET",
            headers={"user-agent": "MyBrowser/1.0"},
        )
        info = _build_request_info(request)
        assert info.user_agent == "MyBrowser/1.0"

    def test_empty_target_when_missing(self) -> None:
        request = make_mocked_request("POST", "/relay")
        info = _build_request_info(request)
        assert info.url == ""

    def test_body_is_none_initially(self) -> None:
        """Body is set to None — filled later after reading request body."""
        request = make_mocked_request(
            "POST",
            "/relay?target=https%3A%2F%2Fexample.com&method=GET",
        )
        info = _build_request_info(request)
        assert info.body is None
