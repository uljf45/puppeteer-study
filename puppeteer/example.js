const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('https://zhuanlan.zhihu.com/p/137922030')
  await page.screenshot({
    path: 'example.png' //保存截图 png
  })
  await browser.close()
})()
