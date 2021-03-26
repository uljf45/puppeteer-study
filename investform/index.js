const puppeteer = require('puppeteer')

let site = 'http://dev.hdfax.com/v2/m/investmentFormInput/index.html'
;(async function () {
  const browser = await puppeteer.launch({
    // ignoreHTTPSErrors: true,
    headless: false, 
    defaultViewport: {
      width: 1000,
      height: 800,
      hasTouch: true,
      isMobile: true,
    },
    args: [
      '--disable-web-security', //https 跨域
      '--allow-running-insecure-content',  //https 跨域
      '--user-data-dir=C:\\MyChromeDevUserData', //https 跨域 设置浏览器个人配置的路径，储存配置 cookie 使下次启动时能直接获取
      ' --auto-open-devtools-for-tabs', // 打开 devtool
      "--no-sandbox", 
    ],
    ignoreDefaultArgs: [
      "--enable-automation" // 忽略 显示自动化测试工具控制中
    ]
  })

  const page = await browser.newPage()

  await page.emulate(puppeteer.devices["iPhone X"])

  await page.goto(site, {
    waitUntil: 'load'
  })


  //cdp session 模拟浏览器打开手机模式 start
  let client = await page.target().createCDPSession()

  await client.send('Emulation.setEmitTouchEventsForMouse', { //允许鼠标模拟touch事件
    enabled: true,
    configuration: 'mobile'
  })

  await client.send('DOM.enable')
  await client.send('Overlay.enable')
  await client.send('Emulation.setDeviceMetricsOverride', {
    deviceScaleFactor: 2,
    dontSetVisibleSize: true,
    height: 0,
    mobile: true,
    positionX: 0,
    positionY: 0,
    scale: 1,
    screenHeight: 667,
    screenOrientation: {type: "portraitPrimary", angle: 0},
    screenWidth: 375,
    width: 0,
  })
  await client.send('Network.setUserAgentOverride', {
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"
  })
  await client.send('Overlay.setShowHinge')
  await client.send('Emulation.resetPageScaleFactor')
  await client.send('Emulation.setDeviceMetricsOverride', {
    deviceScaleFactor: 2,
    dontSetVisibleSize: true,
    height: 0,
    mobile: true,
    positionX: 0,
    positionY: 0,
    scale: 1,
    screenHeight: 667,
    screenOrientation: {type: "portraitPrimary", angle: 0},
    screenWidth: 375,
    width: 0,
  })
  await client.send('Network.setUserAgentOverride', {
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"
  })
  await client.send('Page.enable')
  await client.send('Overlay.setShowHinge')
//cdp session 模拟浏览器打开手机模式 end


  let resp = await page.waitForResponse(response => /op_query_all_declaration_form/.test(response.url()))
  let respJson = await resp.json()
  console.log(respJson)
  if (respJson.resultCode != '1000') { //请求失败跳转到登录
    let captureRequest =  await page.waitForRequest(request => /getCaptcha/.test(request.url())) // 等待获取验证码

    let captureResponse = await page.waitForResponse(response => /getCaptcha/.test(response.url()))
    // let txt = await captureResponse.text()
    // console.log(txt)
  
    let phoneInput = await page.$x(`//input[@placeholder="输入手机号"]`)
    await phoneInput[0].type("15537145866") 
  
    let verifyInput = await page.$x(`//input[@placeholder="输入验证码"]`)
    await verifyInput[0].type('1234')
  
    let verifyBtn = await page.$x(`//button[string()="验证手机号"]`)
    await verifyBtn[0].tap()

    try {
      await page.waitForResponse(response => /isRegistered/.test(response.url()))
    } catch (e) {
      await verifyBtn[0].tap()
    }
  
    await page.waitForNavigation()
  
    await page.waitForXPath(`//input[@placeholder="输入登录密码"]`)
    
    let pwdInput = await page.$x(`//input[@placeholder="输入登录密码"]`)
    await pwdInput[0].type('lys123456')
    let loginBtn = await page.$x(`//button[string()="登录"]`)
    await loginBtn[0].tap()

    try {
      let rep = await page.waitForResponse(response => /login/.test(response.url()))
      console.log(rep)
    } catch(e) {
      await page.goto(site)
    }

    // await page.waitForNavigation({
    //   waitUntil: 'domcontentloaded'
    // })
  } else {
    // await page.waitForNavigation({
    //   waitUntil: 'domcontentloaded'
    // })
  }

  await page.waitForXPath(`//li[@class="prev_list_inner"]/div[string()="填写报单"]`)

  let createOrd = await page.$x(`//li[@class="prev_list_inner"]/div[string()="填写报单"]`)
  createOrd[0].tap()

})()