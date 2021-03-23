const puppeteer = require("puppeteer");
const util = require('../util/index');
const joinPic = require('../util/joinPic');
const startShot = require('../util/startShot');
const path = require('path');
const puppeteerHelper = require('../util/puppeteerHelper')

let params = process.argv.slice(2);
let url = params[0];
let isMobile = true; //params.includes('--mobile');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--start-maximized"], // --start-maximized 全屏显示
  })

  const page = await browser.newPage();

  await page.emulate(puppeteer.devices["iPhone X"]);

  // if (isMobile) {  //设置 viewport 会导致截全屏右边不全
  //   await page.emulate(puppeteer.devices['iPhone X']);
  //   const pageSize = {
  //     width: 375,
  //     height: 812
  //   };
  //   console.log(pageSize.height)
  //   await page.setViewport({
  //     width: pageSize.width,
  //     height: pageSize.height
  //   });
  // }



  await page.goto('https://www.baidu.com')

  await page.type("#index-kw", 'puppeteer');
  
  await page.click('#index-bn');

  await page.waitForNavigation({
    timeout: 5000
  });

  await page.waitForTimeout(3000)

  await page.click('.close-button')


  await util.existsFolder('../output/baidu')

  let p = path.join(__dirname, `../output/baidu/baidu_${util.getCurDateStrForFile()}.png`)

  console.log('图片导出到:', p)
  
  // await puppeteerHelper.startScrollCapture(page)

  // console.log('before joinPic')
  // await joinPic.do(p)

  puppeteerHelper.fullPageScreenShot(page)

  // await page.screenshot({
  //   path: p,
  //   fullPage: true
  // })


  
  // await browser.close()
})();