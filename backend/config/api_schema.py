"""OpenAPI generation limited to the public product API (excludes Wagtail admin internals)."""


def only_public_api(endpoints, **kwargs):
    return [endpoint for endpoint in endpoints if endpoint[0].startswith("/api/v1/")]
