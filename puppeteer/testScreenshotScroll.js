const puppeteer = require("puppeteer");
const util = require('./util/index');
const joinPic = require('./util/joinPic');

(async () => {
  util.delDir('folder')
  
  // 启动Chromium
  const browser = await puppeteer.launch({
    devtools: true,
    ignoreHTTPSErrors: true,
    headless: false,
    args: ["--no-sandbox", "--start-maximized"],
  });
  
  // 打开新页面
  const page = await browser.newPage();

  // 设置页面分辨率
  await page.setViewport({
    width: 1800,
    height: 800,
  });

  let request_url = "https://juejin.cn/post/6940976355097985032";

  // 访问
  await page
    .goto(request_url, {
      waitUntil: "load",
    })
    .catch((err) => console.log(err));

  await page.waitFor(1000);

  let title = await page.title();
  console.log(title);

  // 网页加载最大高度
  let max_height_px = 10000;
  // 滚动高度
  let scrollStep = 800;
  let scrollStepPlus = 801;
  let height_limit = false;
  let mValues = {
    scrollEnable: true,
    height_limit: height_limit,
  };

  await page.evaluate(() => { // 掘金网站首页进入底部浮框
    document.querySelector('.recommend-box').remove();
  });

  var maxH = {
    val: 0
  }

  maxH = await page.evaluate(() => {
    return {
      val: document.scrollingElement.offsetHeight
    }
  })

  max_height_px = Math.max(maxH.val, scrollStepPlus)

  util.sleep(500)

  await page.screenshot({
    path: 'folder/' + 0 + '.png'
  })

  let count = 1
  while (mValues.scrollEnable) {
    mValues = await page.evaluate(
      (scrollStep, max_height_px, height_limit, scrollStepPlus, ctx) => {
        if (document.scrollingElement) {
          let scrollTop = document.scrollingElement.scrollTop;
          document.scrollingElement.scrollTop = scrollTop + Number(scrollStep);

          if (
            document.scrollingElement.scrollTop + Number(scrollStep) >
            max_height_px
          ) {
            height_limit = true;
          }
          let scrollEnableFlag = false;
          if (document.body) {
            scrollEnableFlag = (document.body.clientHeight > (scrollTop + scrollStepPlus)) && !height_limit;
          } else {
            scrollEnableFlag = document.scrollingElement.scrollTop + scrollStep > scrollTop + scrollStepPlus && !height_limit;
          }
          return {
            scrollEnable: scrollEnableFlag,
            height_limit: height_limit,
            document_scrolling_Element_scrollTop: document.scrollingElement.scrollTop,
          };
        }
      },
      scrollStep,
      max_height_px,
      height_limit,
      scrollStepPlus,
    );

    await util.sleep(1200);

    count++;

    await page.screenshot({
      path: 'folder/' + count + '.png'
    })

    await util.sleep(100);
  }

  await browser.close();

  joinPic.do()

})();