import time

from prometheus_client import Counter, Histogram
from starlette.middleware.base import BaseHTTPMiddleware


# Total HTTP requests
REQUEST_COUNT = Counter(
    "space_platform_http_requests_total",
    "Total number of HTTP requests",
    ["method", "endpoint", "status_code"]
)


# API response latency
REQUEST_LATENCY = Histogram(
    "space_platform_http_request_duration_seconds",
    "HTTP request processing time in seconds",
    ["method", "endpoint"]
)


# HTTP errors
ERROR_COUNT = Counter(
    "space_platform_http_errors_total",
    "Total number of HTTP error responses",
    ["method", "endpoint", "status_code"]
)


class PrometheusMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request, call_next):

        start_time = time.perf_counter()

        response = await call_next(request)

        duration = time.perf_counter() - start_time

        endpoint = request.url.path
        method = request.method
        status_code = response.status_code

        REQUEST_COUNT.labels(
            method=method,
            endpoint=endpoint,
            status_code=status_code
        ).inc()

        REQUEST_LATENCY.labels(
            method=method,
            endpoint=endpoint
        ).observe(duration)

        if status_code >= 400:
            ERROR_COUNT.labels(
                method=method,
                endpoint=endpoint,
                status_code=status_code
            ).inc()

        return response