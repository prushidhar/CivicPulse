import asyncio
from pyppeteer import launch

async def main():
    browser = await launch(headless=True, executablePath="C:/Program Files/Google/Chrome/Application/chrome.exe")
    page = await browser.newPage()
    await page.goto("http://localhost:3000")
    await page.waitForTimeout(5000)
    await page.screenshot({"path": "screenshot.png", "fullPage": True})
    await browser.close()

asyncio.run(main())
