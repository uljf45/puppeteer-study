const puppeteer = require('puppeteer')

;(async function () {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
    args: [
      "--start-maximized", "--no-sandbox", 
    ]
  })

  const page = await browser.newPage()
  page.setViewport({
    width: 1400,
    height: 800
  })

  await page.goto('https://www.baidu.com/', {
    waitUntil: 'load'
  })

  let img_url = "https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png";
  //测试获取图片

  let client = await page.target().createCDPSession(); // 创建cdp 
  await client.send('Page.enable') //page session 需先开启
  
   let {content, base64Encoded} = await client.send('Page.getResourceContent', { //发送消息
    frameId: page.mainFrame()._id,
    url: img_url
  })

  /* 获取js文件 start */
  let scriptUrl = `https://dss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/js/lib/jquery-1-edb203c114.10.2.js`
  let {content:scriptStr } = await  client.send('Page.getResourceContent', {
    frameId: page.mainFrame()._id,
    url: scriptUrl
  })
  await console.log(scriptStr)
  /* 获取js文件 end */

  let img_str = content
  // //验证获取的图片是否正确
  let base64_prefix = 'data:image/png;base64,';
  img_url = base64_prefix + img_str;
  await page.goto(img_url);


  // return

  // await page.goto('https://www.jianshu.com', {
  //   waitUntil: 'domcontentloaded'
  // })

  // let xp = `//a[@id="sign_in"]`
  // await page.waitForXPath(xp, {
  //   timeout: 10 * 1000
  // })

  // let elem = await page.$x(xp)
  // elem && (elem.length > 0) && (elem = elem[0])

  // await elem.click();
  // await page.waitForNavigation()

  // let input = await page.$('#session_email_or_mobile_number')
  // await input.type('514068765@qq.com')
  // input = await page.$('#session_password')
  // await input.type('hd123456')
  
  // let btn = await page.$('#sign-in-form-submit-btn')
  // await btn.click()

  // await page.waitForNavigation({
  //   timeout: 60 * 1000,
  //   waitUntil: 'domcontentloaded'
  // })

  // console.log('login success')
  


})();