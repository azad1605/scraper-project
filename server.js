const express = require("express");
const { chromium } = require("playwright");

const app = express();

// Health check route (important for testing)
app.get("/", (req, res) => {
  res.send("Scraper API is running 🚀");
});

// API endpoint
app.get("/scrape", async (req, res) => {
  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // required for cloud
    });

    const page = await browser.newPage();

    // Open page
    await page.goto(
      "https://www.barodabnpparibasmf.in/insights/weekly-market-overview",
      { waitUntil: "domcontentloaded" },
    );

    await page.waitForSelector(".investor-card");

    // Find first WEEKLY WRAP card
    const firstCard = page
      .locator(".investor-card")
      .filter({
        has: page.locator('h3:has-text("WEEKLY WRAP")'),
      })
      .first();

    // Extract date
    const date = await firstCard.locator(".head-date p").innerText();

    // Click KNOW MORE
    const knowMoreLink = firstCard.locator('a:has-text("KNOW MORE")');

    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      knowMoreLink.click(),
    ]);

    // Wait for detail page
    await page.waitForSelector(".insight-detail-page");

    // Extract title
    const title = await page.locator(".insight-detail-page h2").innerText();

    // Extract full content
    const content = await page.locator(".insight-detail-page").innerText();

    // Send response
    res.json({
      source: "Baroda BNP",
      date,
      title,
      content,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// IMPORTANT: dynamic port for Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
