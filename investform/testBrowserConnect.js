const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const pupHelp = require('./util/pupHelp')

;(async function () {
  let filePath = path.join(__dirname, 'browserWSEndpoint.txt')
  const browserWSEndpoint = fs.readFileSync(filePath, { //从文件里读取ws endpoint
    encoding: 'utf-8'
  })
  console.log(browserWSEndpoint)

  const browser = await puppeteer.connect({browserWSEndpoint}) //连接到已经存在的浏览器

  const page = await browser.newPage()
  await page.goto(`https://www.163.com`)
  await pupHelp.mimicPhone(page) //模拟f12 切换手机模式

})();