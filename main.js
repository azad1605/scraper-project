import { Actor } from "apify";
import { chromium } from "playwright";

await Actor.init();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto(
  "https://www.barodabnpparibasmf.in/insights/weekly-market-overview",
);

await page.waitForSelector(".investor-card");

const firstCard = page
  .locator(".investor-card")
  .filter({
    has: page.locator('h3:has-text("WEEKLY WRAP")'),
  })
  .first();

const date = await firstCard.locator(".head-date p").innerText();

const knowMoreLink = firstCard.locator('a:has-text("KNOW MORE")');

await Promise.all([page.waitForNavigation(), knowMoreLink.click()]);

await page.waitForSelector(".insight-detail-page");

const title = await page.locator(".insight-detail-page h2").innerText();
const content = await page.locator(".insight-detail-page").innerText();

await Actor.pushData({
  source: "Baroda BNP",
  date,
  title,
  content,
});

await browser.close();
await Actor.exit();
