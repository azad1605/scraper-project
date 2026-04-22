const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // 1. Open main page
  await page.goto(
    "https://www.barodabnpparibasmf.in/insights/weekly-market-overview",
  );

  // 2. Wait for cards to load
  await page.waitForSelector(".investor-card");

  // 3. Get FIRST "WEEKLY WRAP" card
  const firstCard = page
    .locator(".investor-card")
    .filter({
      has: page.locator('h3:has-text("WEEKLY WRAP")'),
    })
    .first();

  // 4. Click KNOW MORE inside that card
  const knowMoreLink = firstCard.locator('a:has-text("KNOW MORE")');

  // 5. Wait for navigation while clicking
  await Promise.all([page.waitForNavigation(), knowMoreLink.click()]);

  // 6. Wait for detail page content
  await page.waitForSelector(".insight-detail-page");

  // 7. Extract all text content
  const content = await page.locator(".insight-detail-page").innerText();

  // 8. Print result
  console.log("===== EXTRACTED CONTENT =====");
  console.log(content);

  await browser.close();
})();
