const puppeteer = require("puppeteer");
const fs = require('fs');
const images = require('images')

(async () => {
  delDir('folder')
  
  // 启动Chromium
  const browser = await puppeteer.launch({
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
      waitUntil: "domcontentloaded",
    })
    .catch((err) => console.log(err));
  await page.waitFor(1000);
  let title = await page.title();
  console.log(title);
  // 网页加载最大高度
  const max_height_px = 14778;
  // 滚动高度
  let scrollStep = 800;
  let scrollStepPlus = 801;
  let height_limit = false;
  let mValues = {
    scrollEnable: true,
    height_limit: height_limit,
  };
  await page.evaluate(() => {
    document.querySelector('.recommend-box').remove()
  })
  let count = 0
  while (mValues.scrollEnable) {
    mValues = await page.evaluate(
      (scrollStep, max_height_px, height_limit, scrollStepPlus) => {
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
              document.body.clientHeight > scrollTop + scrollStepPlus && !height_limit;
          } else {
            scrollEnableFlag =
              document.scrollingElement.scrollTop + scrollStep >
                scrollTop + scrollStepPlus && !height_limit;
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
      height_limit,
      scrollStepPlus
    );
    await sleep(1400);
    count++;
    await page.screenshot({
      path: 'folder/' + count + '.png'
    })
    await sleep(100);
  }
  

  // try {
  //   await page
  //     .screenshot({
  //       path: "tabobao1.png",
  //       // quality: 10,
  //       fullPage: true,
  //     })
  //     .catch((err) => {
  //       console.log("截图失败");
  //       console.log(err);
  //     });
  //   // await page.waitFor(5000);
  // } catch (e) {
  //   console.log("执行异常");
  // } finally {
    await browser.close();
  // }
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
};

function delDir(path) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach((file, index) => {
      let curPath = path + '/' + file;
      if (fs.statSync(curPath).isDirectory()) {
        delDir(curPath) //递归删除文件夹
      } else {
        fs.unlinkSync(curPath) //删除文件
      }
    })
  }
};

// function delFiles(path) {
//   const all = []
//   if (fs.existsSync(path)) {
//     files = fs.readdirSync(path)

//   }
// }

