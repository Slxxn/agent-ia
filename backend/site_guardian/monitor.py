"""Checks uptime et SSL."""
import httpx
import ssl
import socket
from datetime import datetime, timezone


async def check_uptime(url: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            import time
            start = time.time()
            resp = await client.get(url)
            elapsed = round((time.time() - start) * 1000)
            return {
                "status": "ok" if resp.status_code < 400 else "error",
                "status_code": resp.status_code,
                "response_time_ms": elapsed,
            }
    except Exception as e:
        return {"status": "down", "error": str(e), "response_time_ms": None}


def check_ssl_expiry(hostname: str) -> dict:
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.socket(), server_hostname=hostname) as s:
            s.settimeout(10)
            s.connect((hostname, 443))
            cert = s.getpeercert()
            expires_str = cert["notAfter"]
            expires = datetime.strptime(expires_str, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
            days_left = (expires - datetime.now(timezone.utc)).days
            return {
                "status": "ok" if days_left > 14 else "warning" if days_left > 0 else "expired",
                "days_left": days_left,
                "expires_at": expires.isoformat(),
            }
    except Exception as e:
        return {"status": "error", "error": str(e), "days_left": None}


async def run_checks_for_site(site: dict) -> list[dict]:
    url = site.get("site_url", "")
    if not url:
        return []

    now = datetime.now(timezone.utc).isoformat()
    results = []

    uptime = await check_uptime(url)
    results.append({
        "site_id": site["id"],
        "check_type": "uptime",
        "status": uptime["status"],
        "details": str(uptime),
        "checked_at": now,
    })

    try:
        from urllib.parse import urlparse
        hostname = urlparse(url).netloc
        ssl_check = check_ssl_expiry(hostname)
        results.append({
            "site_id": site["id"],
            "check_type": "ssl",
            "status": ssl_check["status"],
            "details": str(ssl_check),
            "checked_at": now,
        })
    except Exception:
        pass

    return results
