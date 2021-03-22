const puppeteer = require('puppeteer');

const iPhone = puppeteer.devices['iPhone 8']; //指定为手机端

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 250,
    // devtools: true
  })
  const page = await browser.newPage()
  await page.emulate(iPhone)
  await page.goto('https://www.163.com',{
    waitUntil: "networkidle2"
  })
  setTimeout(async () => {
    await page.screenshot({
      path: 'example.jpg', //保存截图 png
      quality: 100,
       fullPage: true
    })
    await browser.close()
  }, 60000)
  
})()
