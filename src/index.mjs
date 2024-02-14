import { config } from "../config.js";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());
const options = { waitUntil: "load" };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createData(data) {
  return fetch(`${config.firebaseAPI}/users.json`, {
    method: "POST",
    body: JSON.stringify(data),
  })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      console.error("Error:", error);
      throw error;
    });
}

const browser = await puppeteer.launch({
  timeout: 0,
  headless: false,
  defaultViewport: null,
  executablePath: config.chromePATH,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    config.proxy.enable ? `--proxy-server=${config.proxy.server}` : undefined,
  ],
  ignoreHTTPSErrors: true,
  userDataDir: "temp",
});

const page = await browser.newPage();
await page.goto("https://x.com", options);
let sent = 0,
  failed = 0,
  res;
await page.evaluate(() => {
  let tName, tBody, tLink, tmp, result;
});
while (true) {
  await sleep(1000);
  console.log("checking...");
  res = await page.evaluate(async (config) => {
    result = [];
    document
      .querySelectorAll(config.selectorAds)
      .forEach(async (e) => {
        tmp =
          e?.children?.[4]?.children[0].children[0].children[1].children[1]
            .children;
        if (tmp) {
          [tName, tBody, tLink] = tmp;
          tName = tName?.innerText;
          tBody = tBody?.innerText;
          tLink = tLink?.children[1]?.href;
          tmp = { tName, tBody, tLink };
          result.push({ tName, tBody, tLink });
        }
      });
    return result;
  },config);
  if (!res) continue;
  for (let i of res) {
    await createData(i)
      .then((res) => res.json())
      .then((res) => {
        ++sent;
      })
      .catch((err) => {
        ++failed;
        console.warn("ERROR@", err);
      });
    console.log(
      `\n[-]Failed: ${failed}\n[+]Sent: ${sent}\n====================`
    );
  }
  await page.evaluate((config) => {
    document
      .querySelectorAll(config.selectorAds)
      .forEach(e=>e.remove())
    window.scrollBy(0, 5000);
  },config);
}

