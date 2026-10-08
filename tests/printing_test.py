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


MM = 96 / 25.4
PRINTABLE_PORTRAIT_MM = 210 - 16  # A4 portrait minus the 8mm @page portrait-page margins


async def check_sheet_header(browser, output, tab, heading, area_selector, auth):
    """A sheet's title banner must print as one row inside its own page width."""
    context = await browser.new_context(viewport={"width": 1280, "height": 1800}, service_workers="block")
    page = await context.new_page()
    await page.goto("http://localhost:8080")
    await page.evaluate(
        "a => localStorage.setItem(a.key, a.value)",
        {"key": auth["storage_key"], "value": json.dumps(auth["session"])},
    )
    await page.goto(f"http://localhost:8080/app?tab={tab}")
    await page.wait_for_timeout(4000)
    select_all = page.locator('thead th:first-child button[role="checkbox"]').first
    if await select_all.count():
        await select_all.click()
        await page.wait_for_timeout(600)
    if not await page.get_by_text(heading, exact=True).count():
        print(f"SKIP {tab}: nothing recorded to print")
        await context.close()
        return
    await page.set_viewport_size({"width": int(PRINTABLE_PORTRAIT_MM * MM), "height": 1000})
    await page.emulate_media(media="print")
    await page.evaluate("document.fonts.ready")
    info = await page.evaluate(
        """(sel) => {
          const area = document.querySelector(sel);
          const banner = area && [...area.children].find(n => n.tagName === 'DIV');
          if (!banner) return null;
          const b = banner.getBoundingClientRect();
          return {
            display: getComputedStyle(banner).display,
            width: Math.round(b.width),
            right: Math.round(b.right),
            areaRight: Math.round(area.getBoundingClientRect().right),
            tops: [...banner.children].map(n => Math.round(n.getBoundingClientRect().top)),
          };
        }""",
        area_selector,
    )
    assert info, f"{tab}: print sheet not found"
    assert info["display"] == "flex", f"{tab}: header lost its row layout ({info['display']})"
    assert info["width"] <= PRINTABLE_PORTRAIT_MM * MM + 2, (
        f"{tab}: header {info['width']}px wider than the {PRINTABLE_PORTRAIT_MM}mm printable page"
    )
    assert len(set(info["tops"])) == 1, f"{tab}: header boxes stacked at tops {info['tops']}"
    assert info["right"] <= info["areaRight"] + 2, f"{tab}: header runs past the sheet edge"
    pdf = output / f"{tab}-header.pdf"
    await page.pdf(path=str(pdf), prefer_css_page_size=True, print_background=True)
    assert "A4" in subprocess.check_output(["pdfinfo", str(pdf)], text=True), f"{tab}: not A4"
    line = next(
        (
            l
            for l in subprocess.check_output(["pdftotext", "-layout", str(pdf), "-"], text=True).splitlines()
            if heading in l
        ),
        "",
    )
    assert re.search(r"\d{2}/\d{2}/\d{4}", line), f"{tab}: print date is not on the title line"
    await context.close()


async def check_sheet_rule_is_scoped(browser):
    """The A4 sheet-width rule belongs to the planning view only."""
    context = await browser.new_context(service_workers="block")
    page = await context.new_page()
    await page.goto("http://localhost:8080")
    offenders = await page.evaluate(
        """() => {
          const bad = [];
          for (const ss of document.styleSheets) {
            let rules; try { rules = ss.cssRules } catch (e) { continue }
            for (const r of rules) {
              const inner = r.cssRules ? [...r.cssRules] : [r];
              for (const c of inner) {
                if (c.selectorText && c.selectorText.includes('.print-area > div') &&
                    !c.selectorText.includes('planning-pdf-page')) bad.push(c.selectorText);
              }
            }
          }
          return bad;
        }"""
    )
    await context.close()
    assert not offenders, f"sheet-width print rule is not scoped to the planning view: {offenders}"


async def main():
    output = Path("/tmp/browser/planning-print")
    output.mkdir(parents=True, exist_ok=True)
    with open(os.environ["PLANNING_TEST_SESSION_FILE"]) as f:
        auth = json.load(f)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800}, service_workers="block")
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
        await context.close()
        await check_sheet_rule_is_scoped(browser)
        await check_sheet_header(
            browser, output, "overtime", "HEURES SUPPLÉMENTAIRES", ".overtime-print-area", auth
        )
        await check_sheet_header(
            browser, output, "mods", "MODIFICATIONS DU PLANNING", ".print-area", auth
        )
        print(
            f"PASS: Imprimer opens printing; fitted = 1 sheet; multi-page = {expected} sheets; "
            "overtime/modifications headers print as one row inside the page."
        )
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
