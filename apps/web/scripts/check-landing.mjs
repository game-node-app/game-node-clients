import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
// Run against the web app with Playwright available, or set PLAYWRIGHT_MODULE to its installed path.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true });
try {
  for (const language of ["pt-BR", "en"]) {
    for (const width of [375, 768, 1440, 2560, 3840]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      await page.addInitScript(
        (language) => localStorage.setItem("gamenode-language", language),
        language,
      );
      await page.goto(
        `${process.env.LANDING_URL || "http://localhost:3100"}${language === "pt-BR" ? "/pt-BR" : "/"}`,
        { waitUntil: "domcontentloaded" },
      );
      await page.waitForFunction(
        (expected) =>
          document.querySelector("h1")?.textContent?.includes(expected),
        language === "en"
          ? "Organize all your games"
          : "Organize todos os seus jogos",
      );
      await page.locator("footer").scrollIntoViewIfNeeded();
      await page.evaluate(() =>
        Promise.all(
          [...document.images].map((img) => img.decode().catch(() => {})),
        ),
      );
      assert.equal(await page.locator("h1").count(), 1);
      assert.match(
        await page.locator("h1").innerText(),
        language === "en"
          ? /Organize all your games/
          : /Organize todos os seus jogos/,
      );
      assert.equal(await page.locator("#features h3").count(), 5);
      assert.equal(await page.locator("#premium li").count(), 7);
      assert.equal(
        await page.locator('a[href="https://patreon.com/GameNodeApp"]').count(),
        1,
      );
      assert.equal(await page.locator('a[href="#"]').count(), 0);
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Horizontal overflow: ${language}/${width}`,
      );
      assert.deepEqual(
        await page.evaluate(() =>
          [...document.images]
            .filter((img) => !img.complete || !img.naturalWidth)
            .map((img) => img.src),
        ),
        [],
      );
      assert.equal(await page.locator('img[src*="figma.com"]').count(), 0);
      assert(
        await page.locator('img[src$="hero-background.png"]').evaluate((img) => {
          const background = img.getBoundingClientRect();
          const hero = img.parentElement.getBoundingClientRect();
          return background.left <= hero.left && background.right >= hero.right
            && background.top <= hero.top && background.bottom >= hero.bottom;
        }),
        `Hero background does not cover its container: ${language}/${width}`,
      );
      if (width === 375) {
        await page
          .getByRole("button", {
            name: language === "en" ? "Navigation" : "Navegação",
          })
          .click();
        await page.getByRole("menuitem").first().waitFor();
        assert.equal(await page.getByRole("menuitem").count(), 5);
        await page.keyboard.press("Escape");
      }
      await page.keyboard.press("Control+Home");
      await page.keyboard.press("Tab");
      assert(
        await page.evaluate(() => document.activeElement?.tagName !== "BODY"),
      );
      await page.screenshot({
        path: `/tmp/landing-${language}-${width}.png`,
        fullPage: true,
      });
      await page.close();
      console.log(`${language}/${width}: passed`);
    }
  }
} finally {
  await browser.close();
}
