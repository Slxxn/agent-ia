"""
Screenshot Tool — captures the running dev server with Playwright.

Requires: pip install playwright && playwright install chromium
Optional: set SCREENSHOT_URL in .env to override the default localhost:5173
"""

import asyncio
import os
from typing import Optional

try:
    from playwright.async_api import async_playwright, Browser
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

DEFAULT_URL  = os.getenv("SCREENSHOT_URL", "http://localhost:5173")
VIEWPORT_W   = 1440
VIEWPORT_H   = 900
GOTO_TIMEOUT = 30_000   # ms
SETTLE_DELAY = 1.5      # seconds after networkidle before screenshot


class ScreenshotTool:
    """Takes a full-page screenshot of a running Vite dev server."""

    def __init__(self, url: str = DEFAULT_URL):
        self.url = url

    @staticmethod
    def is_available() -> bool:
        return PLAYWRIGHT_AVAILABLE

    async def capture(self, output_path: str, full_page: bool = True) -> bool:
        """
        Navigate to self.url, wait for network idle + settle delay, then screenshot.
        Returns True on success, False on any failure.
        """
        if not PLAYWRIGHT_AVAILABLE:
            return False
        try:
            async with async_playwright() as p:
                browser: Browser = await p.chromium.launch(headless=True)
                ctx = await browser.new_context(
                    viewport={"width": VIEWPORT_W, "height": VIEWPORT_H},
                    device_scale_factor=1,
                )
                page = await ctx.new_page()

                # Suppress noisy console errors from the page
                page.on("console", lambda _: None)

                await page.goto(
                    self.url,
                    wait_until="networkidle",
                    timeout=GOTO_TIMEOUT,
                )
                # Let animations settle
                await asyncio.sleep(SETTLE_DELAY)
                await page.screenshot(path=output_path, full_page=full_page)
                await browser.close()
            return True
        except Exception:
            return False

    async def capture_route(
        self,
        route: str,
        output_path: str,
        full_page: bool = True,
    ) -> bool:
        """Capture a specific route (e.g. '/products')."""
        original_url = self.url
        self.url = self.url.rstrip("/") + route
        ok = await self.capture(output_path, full_page)
        self.url = original_url
        return ok
