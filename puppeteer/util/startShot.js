const puppeteer = require("puppeteer");
const util = require('./index');
const joinPic = require('./joinPic');
const gm = require('gm')

/**
 * @callback mcb
 */

/** 
 * 截屏主函数
 * @param {String} url 
 * @param {Object} callbacks 回调函数列表
 * @param {mcb} callbacks.onload  当页面load完成
 * 
 */
async function main (url, callbacks = {}) {
  util.delDir('folder')
  
  // 启动Chromium
  const browser = await puppeteer.launch({
    // devtools: true,
    ignoreHTTPSErrors: true,
    // headless: false,
    headless: true,
    args: ["--no-sandbox", "--start-maximized"],
  });
  
  // 打开新页面
  const page = await browser.newPage();

  const pageSize = {
    width: 1800,
    height: 800
  }

  // 设置页面分辨率
  await page.setViewport({
    width: pageSize.width,
    height: pageSize.height
  });

  let request_url = url

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
  let max_height_px = 800;
  // 滚动高度
  let scrollStep = pageSize.height;
  let scrollStepPlus = scrollStep + 1;
  let height_limit = false;
  let mValues = {
    scrollEnable: true,
    height_limit: height_limit,
  };

  if (callbacks.onload) {
    await page.evaluate(callbacks.onload);
  }

  var maxH = {
    val: 0
  }

  maxH = await page.evaluate(() => {
    return {
      val: document.body.clientHeight
    }
  })

  max_height_px = Math.max(maxH.val, scrollStepPlus)

  max_height_px = Math.min(max_height_px, 20000)  //设置最大20000 像素

  console.log('offsetHeight ', maxH.val)

  // util.sleep(500)

  let count = 0

  await page.screenshot({
    path: 'folder/' + count + '.png'
  })

  while (mValues.scrollEnable) {
    mValues = await page.evaluate(
      (scrollStep, max_height_px, height_limit, scrollStepPlus, ctx) => {
        if (document.scrollingElement) {
          let scrollTop = document.scrollingElement.scrollTop;
          document.scrollingElement.scrollTop = scrollTop + Number(scrollStep); 

          // 当加上高度时 如何超过页面高度 再用document.scrollingElement.scrollTop 只能得到页面高度
          if ( document.scrollingElement.scrollTop + Number(scrollStep) >= max_height_px ) { //  >= 因为到最底部时 == max_height_px
            height_limit = true;
          }

          let scrollEnableFlag = false;
          if (document.body) {
            scrollEnableFlag = (document.body.clientHeight > (scrollTop + scrollStepPlus)) && !height_limit;
          } else {
            scrollEnableFlag = document.scrollingElement.scrollTop + scrollStep > scrollTop + scrollStepPlus && !height_limit;
          }
          if (!scrollEnableFlag) {
            document.scrollingElement.scrollTop = 0
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
    util.sleep(300)
  }

  height_limit = false
  mValues = {
    scrollEnable: true,
    height_limit: false,
  };
  util.sleep(100)

  while (mValues.scrollEnable) {
    mValues = await page.evaluate(
      (scrollStep, max_height_px, height_limit, scrollStepPlus, ctx) => {
        if (document.scrollingElement) {
          let scrollTop = document.scrollingElement.scrollTop;
          document.scrollingElement.scrollTop = scrollTop + Number(scrollStep); 
          console.log(document.scrollingElement.scrollTop)
          // 当加上高度时 如何超过页面高度 再用document.scrollingElement.scrollTop 只能得到页面高度
          if ( document.scrollingElement.scrollTop + Number(scrollStep) >= max_height_px ) { //  >= 因为到最底部时 == max_height_px
            console.log('into')
            height_limit = true;
          }

          let scrollEnableFlag = false;
          if (document.body) {
            scrollEnableFlag = (document.body.clientHeight > (scrollTop + scrollStepPlus)) && !height_limit;
          } else {
            scrollEnableFlag = document.scrollingElement.scrollTop + scrollStep > scrollTop + scrollStepPlus && !height_limit;
          }
          console.log('height_limit', height_limit)
          console.log(document.scrollingElement.scrollTop)
          console.log('scrollEnableFlag', scrollEnableFlag)
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

    await util.sleep(1000);

    count++;

    let p = 'folder/' + count + '.png'
    await page.screenshot({
      path: p
    })

    await util.sleep(100);

    if (!mValues.scrollEnable && (count + 1) * scrollStep > max_height_px) {
      let dis = (count + 1) * scrollStep - max_height_px
      gm(p).crop(pageSize.width, scrollStep - dis, 0, dis).write(p, (err) => {
        console.log(err)
      })
    }
  }

  // await browser.close();

  joinPic.do()
}

module.exports = {
  do: main
}