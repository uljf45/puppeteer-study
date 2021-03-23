const puppeteer = require('puppeteer');
const util = require('../util/index');
const puppeteerHelp = require('../util/puppeteerHelper');

let url = process.argv[2] || `https://www.163.com`;

;(async function () {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--start-maximized", "--no-sandbox", ""],
    slowMo: 250
  })

  const page = await browser.newPage()
  

  await page.emulate(puppeteer.devices['iPhone X']);

  // const pageSize = {
  //   width: 375,
  //   height: 812
  // };

  // await page.setViewport(pageSize);

  await page.goto(url, {
    waitUntil: "networkidle2"
  })

  puppeteerHelp.fullPageScreenShot(page)

})();