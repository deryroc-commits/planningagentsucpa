"""Authenticated print regression. Run with PLANNING_TEST_SESSION_FILE set.

The session JSON is provided externally, never checked into the project.
PDFs and screenshots stay under /tmp/browser/planning-print.
"""
import asyncio
import json
import os
from pathlib import Path
import re
import subprocess
from playwright.async_api import async_playwright


def page_count(path):
    info = subprocess.check_output(["pdfinfo", str(path)], text=True)
    match = re.search(r"^Pages:\s+(\d+)", info, re.MULTILINE)
    if not match:
        raise AssertionError("PDF page count missing")
    return int(match.group(1))


async def main():
    output = Path("/tmp/browser/planning-print")
    output.mkdir(parents=True, exist_ok=True)
    with open(os.environ["PLANNING_TEST_SESSION_FILE"]) as f:
        auth = json.load(f)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()
        await page.goto("http://localhost:8080")
        await page.evaluate(
            "a => localStorage.setItem(a.key, a.value)",
            {"key": auth["storage_key"], "value": json.dumps(auth["session"])},
        )
        await page.goto("http://localhost:8080/app?tab=print")
        await page.get_by_role("heading", name="Aperçu avant impression").wait_for(timeout=60000)
        await page.get_by_role("combobox", name="Mise en page", exact=True).click()
        await page.get_by_role("option", name="Page adaptée (1 page)", exact=True).click()
        await page.evaluate("document.fonts.ready")
        await page.screenshot(path=str(output / "after-preview.png"))
        await page.evaluate("window.print = () => { window.printRequested = true }")
        await page.get_by_role("button", name="Imprimer", exact=True).click()
        assert await page.evaluate("window.printRequested"), "Print button did not open printing"
        await page.pdf(path=str(output / "after-one.pdf"), prefer_css_page_size=True, print_background=True)
        assert page_count(output / "after-one.pdf") == 1, "Fitted planning must print on exactly one sheet"
        await page.get_by_role("combobox", name="Mise en page", exact=True).click()
        await page.get_by_role("option", name="Pages multiples", exact=True).click()
        expected = await page.locator(".planning-pdf-page").count()
        await page.pdf(path=str(output / "after-multi.pdf"), prefer_css_page_size=True, print_background=True)
        assert page_count(output / "after-multi.pdf") == expected, "Multi-page printing added blank sheets"
        print(f"PASS: Imprimer opens printing; fitted = 1 sheet; multi-page = {expected} sheets.")
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())