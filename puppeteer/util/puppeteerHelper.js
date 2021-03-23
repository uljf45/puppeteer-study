const util = require('./index');
const path = require('path')
const gm = require('gm')
async function startScrollCapture (page, pageSize ) {
  util.delDir('../folder') // 清空folder文件夹下所有图片
  let title = await page.title();
  console.log(title);

  var offset = {
    height: 0
  }

  offset = await page.evaluate(() => {
    return {
      width: document.body.clientWidth,
      height: document.body.clientHeight, //最大高度为页面全高度
      scrollStep: document.documentElement.clientHeight,
    }
  })
  if (!pageSize) {
    pageSize = offset
  } else if (!pageSize.scrollStep) {
    pageSize.scrollStep = offset.scrollStep
  }

  // 网页加载最大高度
  let max_height_px = 800;
  // 滚动高度
  let scrollStep = pageSize.scrollStep;
  let scrollStepPlus = scrollStep + 1;

  let height_limit = false; //判断是否为最大高度

  let mValues = {
    scrollEnable: true, //当前是否能向下滚动
    height_limit: height_limit,
  };

  max_height_px = Math.max(offset.height, scrollStepPlus)

  max_height_px = Math.min(max_height_px, 20000)  //设置最大20000 像素

  console.log('offsetHeight ', offset.height)

  // util.sleep(500)

  let count = 0

  await page.screenshot({ //先截首屏
    path: path.resolve(__dirname,  '../folder/' + count + '.png')
  })

  while (mValues.scrollEnable) { //首次进入先快速滚动到底部
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
          return { // 返回对象
            scrollEnable: scrollEnableFlag,
            height_limit: height_limit,
            document_scrolling_Element_scrollTop: document.scrollingElement.scrollTop,
          };
        }
      }, // 回调函数
      scrollStep, //传入参数1
      max_height_px, //传入参数2
      height_limit, //传入参数3
      scrollStepPlus, //传入参数4
    );
    util.sleep(300)
  }

  height_limit = false // 重置

  mValues = { // 重置
    scrollEnable: true,
    height_limit: false,
    scrollTop: 0,
  };

  let scrollTop = 0

  util.sleep(100)

  while (mValues.scrollEnable) { // 正式滚动截屏
    mValues = await page.evaluate(
      (scrollStep, max_height_px, height_limit, scrollStepPlus, scrollTop) => {
        if (document.scrollingElement) {

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
          console.log('scrollTop', scrollTop)
          console.log('document.scrollingElement.scrollTop', document.scrollingElement.scrollTop)
          console.log('scrollEnableFlag', scrollEnableFlag)
          console.log('max_height_px', max_height_px)
          return {
            scrollEnable: scrollEnableFlag,
            height_limit: height_limit,
            document_scrolling_Element_scrollTop: document.scrollingElement.scrollTop,
            scrollTop: scrollTop + Number(scrollStep)
          };
        }
      },
      scrollStep,
      max_height_px,
      height_limit,
      scrollStepPlus,
      scrollTop
    );

    scrollTop = mValues.scrollTop

    console.log('mValues.document_scrolling_Element_scrollTop', mValues.document_scrolling_Element_scrollTop)

    await util.sleep(1000);

    count++;

    let p = path.resolve(__dirname,  '../folder/' + count + '.png')
    await page.screenshot({
      path: p
    })

    await util.sleep(100);

    if (!mValues.scrollEnable && (count + 1) * scrollStep > max_height_px) {
      console.log('before crop')
      let dis = (count + 1) * scrollStep - max_height_px
      gm(p).crop(pageSize.width, scrollStep - dis, 0, dis).write(p, (err) => {
        console.log(err)
      })
    }
  }
  
};

async function fullPageScreenShot (page) {
  const maxHeight = 20000;
  var offset = {}

  offset = await page.evaluate(() => {
    return {
      width: document.body.clientWidth,
      height: document.body.clientHeight, //最大高度为页面全高度
      scrollStep: document.documentElement.clientHeight,
    }
  })

  let scrollStep = offset.scrollStep || 800 // 每次滚动高度
  let scrollStepPlus = scrollStep + 1
  let heightLimit = false; //高度限制 标志
  let mValues = {
    scrollEnable: true,
    heightLimit: heightLimit
  }

  while(mValues.scrollEnable) { // 如果允许滚动
    mValues = await page.evaluate((scrollStep, maxHeight, heightLimit, scrollStepPlus) => { //回调函数
      if (document.scrollingElement) {
        let scrollTop = document.scrollingElement.scrollTop
        document.scrollingElement.scrollTop = scrollTop + scrollStep

        if (document.scrollingElement.scrollTop + scrollStep > maxHeight) {
          heightLimit = true
        }

        let enable = false

        if ((document.scrollingElement.scrollTop + scrollStep > scrollTop + scrollStepPlus) && !heightLimit) {
          enable = true
        }

        return {
          scrollEnable: enable,
          heightLimit
        }
      }
    }, 
      scrollStep, maxHeight, heightLimit, scrollStepPlus  //传入参数
    )
    
    await page.waitForTimeout(800)
  }

  await page.evaluate(() => {
    document.scrollingElement.scrollTop = 0; //回到页面顶部  解决截图部分空白问题
  })

  await page.screenshot({
    path: path.resolve(__dirname, `../output/${util.getCurDateStrForFile()}.png`),
    fullPage: true
  }).catch(err => {
    console.log('截图失败', err)
  })

}

module.exports = {
  startScrollCapture,
  fullPageScreenShot
}