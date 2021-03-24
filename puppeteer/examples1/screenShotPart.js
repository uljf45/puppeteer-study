const puppeteer = require('puppeteer')
const util = require('../util/index')
const fs = require("fs")

async function capturePart () {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--start-fullscreen']
  })
  const page = await browser.newPage()

  await page.setViewport({width: 1400, height: 800})
  await page.goto('https://youdata.163.com', {
    waitUntil: 'load'
  })
  let element = await page.$('.img-container')

  util.existsFolder('../output/163')
  await element.screenshot({
    path: '../output/163/' + util.getCurDateStrForFile() + '.jpg'
  })
  await page.close()
  await browser.close()
};

async function ssr(url) {
  const browser = await puppeteer.launch({headless: true})
  const page = await browser.newPage()
  await page.goto(url, {
    waitUntil: 'networkidle0'
  })
  const html = await page.content()
  await browser.close()
  return html
}
;(async () => {
  await capturePart()
  return
  let html = await ssr('https://youdata.163.com')
  util.existsFolder('../output/html')
  fs.writeFileSync('../output/html/youdata163.html',html)
})();