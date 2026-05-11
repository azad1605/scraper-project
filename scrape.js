import { chromium } from "playwright";
import axios from "axios";

(async () => {
  console.log("Starting scraper...");

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

  await browser.close();

  console.log("Sending to n8n...");

  await axios.post("https://azadt.app.n8n.cloud/webhook-test/weekly-market", {
    title,
    date,
    content,
  });

  console.log("Done!");
})();

/* 
import { chromium } from "playwright";
import axios from "axios";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

(async () => {
  console.log("Starting scraper...");

  const browser = await chromium.launch({ headless: true });

  // =========================
  // 🔹 BARODA SCRAPER
  // =========================
  const page1 = await browser.newPage();

  await page1.goto(
    "https://www.barodabnpparibasmf.in/insights/weekly-market-overview",
    { waitUntil: "domcontentloaded" },
  );

  await page1.waitForSelector(".investor-card");

  const firstCard = page1
    .locator(".investor-card")
    .filter({
      has: page1.locator('h3:has-text("WEEKLY WRAP")'),
    })
    .first();

  const date = await firstCard.locator(".head-date p").innerText();

  const knowMoreLink = firstCard.locator('a:has-text("KNOW MORE")');

  await Promise.all([page1.waitForNavigation(), knowMoreLink.click()]);

  await page1.waitForSelector(".insight-detail-page");

  const title = await page1.locator(".insight-detail-page h2").innerText();
  const content = await page1.locator(".insight-detail-page").innerText();

  console.log("Baroda data extracted");

  // =========================
  // 🔹 EDELWEISS SCRAPER
  // =========================
  const context2 = await browser.newContext({
    acceptDownloads: true,
  });

  // =========================
  // 🔹 EDELWEISS SCRAPER (ROBUST)
  // =========================
  const page2 = await browser.newPage();

  await page2.goto(
    "https://www.edelweissmf.com/investor-insights/fund-market/weekly-market-update",
    { waitUntil: "domcontentloaded" },
  );

  // wait for JS rendering to complete
  await page2.waitForLoadState("networkidle");

  // Wait until at least one link exists (page hydrated)
  await page2.waitForSelector("a", { timeout: 15000 });

  // Extract PDF URL (robust scan)
  const pdfUrl = await page2.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll("a"));

    for (const a of anchors) {
      const href = a.getAttribute("href") || "";
      if (href.includes(".pdf")) {
        return a.href;
      }
    }

    return null;
  });

  if (!pdfUrl) {
    console.log("DEBUG: dumping page HTML...");
    console.log(await page2.content()); // helps debug if structure changes
    throw new Error("PDF link not found");
  }

  console.log("PDF URL:", pdfUrl);

  // Download PDF via axios
  const response = await axios.get(pdfUrl, {
    responseType: "arraybuffer",
  });

  const fileName = pdfUrl.split("/").pop();
  const filePath = `./${fileName}`;

  fs.writeFileSync(filePath, response.data);

  console.log(`Downloaded: ${fileName}`);

  // Extract PDF
  const pdfData = await pdf(response.data);
  const pdfText = pdfData.text;

  console.log("Edelweiss PDF extracted");

  await browser.close();

  // =========================
  // 🔹 SEND TO N8N
  // =========================
  const payload = {
    baroda: {
      title,
      date,
      content,
    },
    edelweiss: {
      fileName,
      content: pdfText,
    },
  };

  console.log("Sending data to n8n...");

  await axios.post(
    "https://azadt.app.n8n.cloud/webhook-test/weekly-market",
    payload,
  );

  console.log("Done!");
})();
 */
/* import { chromium } from "playwright";
import axios from "axios";
import fs from "fs";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

(async () => {
  console.log("Starting scraper...");

  const browser = await chromium.launch({ headless: true });

  // =========================
  // 🔹 BARODA SCRAPER (WEB)
  // =========================
  const page1 = await browser.newPage();

  await page1.goto(
    "https://www.barodabnpparibasmf.in/insights/weekly-market-overview",
    { waitUntil: "domcontentloaded" },
  );

  await page1.waitForSelector(".investor-card");

  const firstCard = page1
    .locator(".investor-card")
    .filter({
      has: page1.locator('h3:has-text("WEEKLY WRAP")'),
    })
    .first();

  const date = await firstCard.locator(".head-date p").innerText();

  const knowMoreLink = firstCard.locator('a:has-text("KNOW MORE")');

  await Promise.all([
    page1.waitForNavigation({ waitUntil: "domcontentloaded" }),
    knowMoreLink.click(),
  ]);

  await page1.waitForSelector(".insight-detail-page");

  const title = await page1.locator(".insight-detail-page h2").innerText();
  const content = await page1.locator(".insight-detail-page").innerText();

  console.log("Baroda extracted");

  await browser.close();

  // =========================
  // 🔹 EDELWEISS (LOCAL PDF)
  // =========================
  const filePath = "C:/Users/Azad/Downloads/ed market update.pdf";

  const buffer = fs.readFileSync(filePath);

  // Convert buffer to Uint8Array (required by pdfjs)
  const typedArray = new Uint8Array(buffer);

  const loadingTask = pdfjsLib.getDocument({ data: typedArray });

  const pdfDoc = await loadingTask.promise;

  let fullText = "";

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();

    const pageText = content.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  console.log("Edelweiss PDF extracted");
  // =========================
  // 🔹 SEND TO N8N
  // =========================
  const payload = {
    baroda: {
      title,
      date,
      content,
    },
    edelweiss: {
      fileName: "ed market update.pdf",
      content: fullText,
    },
  };

  console.log("Sending data to n8n...");

  await axios.post(
    "https://azadt.app.n8n.cloud/webhook-test/weekly-market",
    payload,
  );

  console.log("Done!");
})();
 */
