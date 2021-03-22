const puppeteer = require("puppeteer");
(async () => {
  // 启动Chromium
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: false,
    args: ["--no-sandbox"],
  });
  // 打开新页面
  const page = await browser.newPage();
  // 设置页面分辨率
  await page.setViewport({
    width: 1920,
    height: 1080,
  });
  let request_url = "https://www.163.com";
  // 访问
  await page
    .goto(request_url, {
      waitUntil: "domcontentloaded",
    })
    .catch((err) => console.log(err));
  await page.waitFor(1000);
  let title = await page.title();
  console.log(title);
  // 网页加载最大高度
  const max_height_px = 20000;
  // 滚动高度
  let scrollStep = 1080;
  let height_limit = false;
  let mValues = {
    scrollEnable: true,
    height_limit: height_limit,
  };
  while (mValues.scrollEnable) {
    mValues = await page.evaluate(
      (scrollStep, max_height_px, height_limit) => {
        if (document.scrollingElement) {
          let scrollTop = document.scrollingElement.scrollTop;
          document.scrollingElement.scrollTop = scrollTop + scrollStep;
          if (
            null != document.body &&
            document.body.clientHeight > max_height_px
          ) {
            height_limit = true;
          } else if (
            document.scrollingElement.scrollTop + scrollStep >
            max_height_px
          ) {
            height_limit = true;
          }
          let scrollEnableFlag = false;
          if (null != document.body) {
            scrollEnableFlag =
              document.body.clientHeight > scrollTop + 1081 && !height_limit;
          } else {
            scrollEnableFlag =
              document.scrollingElement.scrollTop + scrollStep >
                scrollTop + 1081 && !height_limit;
          }
          return {
            scrollEnable: scrollEnableFlag,
            height_limit: height_limit,
            document_scrolling_Element_scrollTop:
              document.scrollingElement.scrollTop,
          };
        }
      },
      scrollStep,
      max_height_px,
      height_limit
    );
    await sleep(800);
  }
  try {
    await page
      .screenshot({
        path: "taobao1.jpg",
        quality: 10,
        fullPage: true,
      })
      .catch((err) => {
        console.log("截图失败");
        console.log(err);
      });
    await page.waitFor(5000);
  } catch (e) {
    console.log("执行异常");
  } finally {
    await browser.close();
  }
})();
//延时函数
function sleep(delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(1);
      } catch (e) {
        reject(0);
      }
    }, delay);
  });
}
