//来源 https://blog.csdn.net/ASAS1314/article/details/84847770?spm=1001.2014.3001.5501
const puppeteer = require('puppeteer');
const util = require('../util/index');
const path = require('path');

(async () => {

  let timeoutMillSeconds = 10000;
  let waitUntilStr = 'domcontentloaded';

  let headlessFlag = false;
  const system_warn = 1002

  let args = [
    '--no-sandbox',
    '--disable-infobars ', // don't show information bar
    '--window-size=1920,1080', // resize window view port size
    '--lang=zh-CN',
    '--disable-dev-shm-usage'
  ];

  const browser = await puppeteer.launch({
    defaultViewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    headless: headlessFlag,
    args
  });

  const page = await browser.newPage();

  let requestUrl = process.argv[2] || 'https://www.163.com'

  await page.goto(requestUrl, {
    timeout: timeoutMillSeconds,
    waitUntil: waitUntilStr
  }).catch(err => {

  })

  let heightLimit = false;
  let scrollTimes = 0;
  let mValues = {
    scrollEnable: true,
    heightLimit,
    times: 10
  }
  let resultMap = new Map();

  try {
    await page.waitForTimeout(5000);

    while (mValues.scrollEnable) {
      mValues = await page.evaluate(
        (maxHeightPx, pageScreenShotHeightLimit, heightLimit, resultMap, system_warn, requestUrl, scrollTimes) => {
          let times = 1
          let scrollEnable = true
          if (document.body) {
            window.scrollBy(0, window.innerHeight);
            times = parseInt(document.body.clientHeight / 1080)

            // 超出图片的限制高度，生成PDF
            if (document.body.clientHeight > pageScreenShotHeightLimit) {
              heightLimit = true
            }
            // 超出网页的限制高度，不再滚动
            if (document.body.clientHeight > maxHeightPx && scrollTimes > 40) {
              resultMap['resultCode'] = system_warn;
              resultMap['warning'] = '网页加载高度过长，易造成数据获取失败。';
              scrollEnable = false;
            }
          } else {
            scrollEnable = false;
          }

          times += 1
          return {
            scrollEnable,
            heightLimit,
            times,
            title: document.title
          }
        },
        60000, 60000, heightLimit, resultMap, system_warn, requestUrl, scrollTimes
      );

      let randomMillSecond = Math.random() * 1400 + 600
      await page.waitForTimeout(randomMillSecond)
      scrollTimes++
      console.log(requestUrl + ' 需要滚动 : ' + mValues.times + '次 , 滚动第[' + scrollTimes + ']次');
      if (scrollTimes > mValues.times) {
        console.log(requestUrl + ' 结束');
        mValues.scrollEnable = false
      }
    }

    await page.evaluate(() => {
      window.scrollTo(0, 0)
    })

    await page.screenshot({
      path: path.resolve(__dirname, `../output/${util.getCurDateStrForFile()}.png`),
      fullPage: true
    });
  } catch(err) {
    console.log(err)
  }


})();
