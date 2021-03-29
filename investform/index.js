const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

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
    devtools: true,
    args: [
      '--disable-web-security', //https 跨域
      '--allow-running-insecure-content',  //https 跨域
      '--user-data-dir=C:\\MyChromeDevUserData', //https 跨域 设置浏览器个人配置的路径，储存配置 cookie 使下次启动时能直接获取
      ' --auto-open-devtools-for-tabs', // 打开 devtool
      "--no-sandbox", 
    ],
    ignoreDefaultArgs: [
      "--enable-automation", // 忽略 显示自动化测试工具控制中
      '--disable-extensions' // 允许扩展程序

    ]
  })

  const browserWSEndpoint = browser.wsEndpoint() 
  console.log(browserWSEndpoint)
  let outPath = path.resolve(__dirname, 'browserWSEndpoint.txt')
  fs.writeFileSync(outPath, browserWSEndpoint) //将该浏览器的ws endpoint 保存到文件

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

  await client.send('Network.enable')
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
  await client.send('Network.setBlockedURLs', { // 禁止某些js文件
    urls: ["https://hm.baidu.com/hm.js?e994280905f4e78db10dfbb739e87ee0"]
  })
//cdp session 模拟浏览器打开手机模式 end



  let resp = await page.waitForResponse(response => /op_query_all_declaration_form/.test(response.url()))
  let respJson = await resp.json()
  // console.log(respJson)
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
      // console.log(rep)
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
  await createOrd[0].tap()
  await page.waitForNavigation()

  let [respBankInfo, respSellableProduct] = await Promise.all([  //判断多个接口请求
    page.waitForResponse(resp => /op_query_recommender_bank_info/.test(resp.url())),
    page.waitForResponse(resp => /op_query_sellable_resv_prod_quote_by_group_id/.test(resp.url())),
  ])

  let spRes = await respSellableProduct.json()
  let prdName = spRes["resvProds"][0]["productName"]
  // console.log(prdName)

  let div = await page.$x(`//span[string()="单据类型*"]/../div`)
  await div[0].tap()

  await page.waitForXPath(`//div[@class="modalContentLeft"]//span[string()="普通单据13"]`)
  let billTypeSpan = await page.$x(`//div[@class="modalContentLeft"]//span[string()="普通单据13"]`)
  await billTypeSpan[0].tap()
  let confirmBtn = await page.$x(`//div[@class="modalFooter"]/span[string()="确定"]`)
  await confirmBtn[0].tap()

  let input = await page.$x(`//input[@placeholder="请填写投顾姓名"]`)
  await input[0].type('毛颜')

  input = await page.$x(`//input[@placeholder="请填写客户手机号"]`)
  await input[0].type('13632545135')

  input = await page.$x(`//input[@placeholder="请填写客户姓名"]`)
  await input[0].type('陈泽敏')

  input = await page.$x(`//input[@placeholder="请填写证件号码"]`)
  await input[0].type('440582199005161810')

  try {
    page.waitForXPath('//div[@class="pop_name" and @style=""]/button').then(async () => { //异步执行, 不使用await await会阻塞主线程
      let popNameKeHu = await page.$x('//div[@class="pop_name"]/button')
      await popNameKeHu[0].tap()
    })
  } catch(err) {

  }

  // try {
  //   page.waitForXPath('//div[@class="pop_name"]/button').then(async () => {
  //     page.$x('//div[@class="pop_name"]/button').then((array) => {
  //       array[0].tap()
  //     })
  //   })
  // } catch(err) {

  // }

  let sel = await page.$x('//span[string()="是否有推荐人*"]/../select') // select下拉框选择
  // await sel[0].tap()
  await sel[0].select("0")  // select 选中下面的option 值为0
  // let opt = await page.$x('//span[string()="是否有推荐人*"]/..//option[@value="0"]') //选否
  // await opt[0].tap()

  input = await page.$x(`//input[@placeholder="请输入产品名称"]`)
  await input[0].type(prdName)

  sel = await page.$x(`//li[string()="${prdName}"]`)
  await sel[0].tap()

  async function inputTypeByPlaceHoder(holderStr, val) {
    let input = await page.$x(`//input[@placeholder="${holderStr}"]`)
    await input[0].type(`${val}`)
  }

  input = await page.$x(`//input[@placeholder="请输入金额"]`)
  await input[0].type('11')

  input = await page.$x(`//span[string()="银行卡号*"]/../input[@placeholder="请填写银行卡号"]`)
  await input[0].type(`123456789123456789`)

  input = await page.$x(`//input[@placeholder="请输入银行名称"]`)
  // await input[0].focus()
  await input[0].type(`中国工商银行`, {
    delay: 100
  })
  await page.waitForXPath(`//li[string()="中国工商银行"]`)
  sel = await page.$x(`//li[string()="中国工商银行"]`)
  await sel[0].tap()
  console.log('select bank name done')

  await page.waitForResponse(resp => /op_query_bank_province_list/.test(resp.url()))
  input = await page.$x(`//input[@placeholder="请输入开户行省份"]`)
  await input[0].type(`广东省`, {
    delay: 100
  })
  await page.waitForXPath(`//li[string()="广东省"]`)
  sel = await page.$x(`//li[string()="广东省"]`)
  await sel[0].tap()

  console.log('select province done')

  await page.waitForResponse(resp => /op_query_bank_city_list/.test(resp.url()))
  input = await page.$x(`//input[@placeholder="请输入开户行城市"]`)
  await input[0].type(`深圳市`, {
    delay: 100
  })
  await page.waitForXPath(`//li[string()="深圳市"]`)
  sel = await page.$x(`//li[string()="深圳市"]`)
  await sel[0].tap()

  await page.waitForResponse(resp => /op_query_bank_branch_list/.test(resp.url()))
  input = await page.$x(`//input[@placeholder="请输入开户行名称"]`)
  await input[0].type(`中国工商银行深圳市分行`, {
    delay: 100
  })
  await page.waitForXPath(`//li[string()="中国工商银行深圳市分行"]`)
  sel = await page.$x(`//li[string()="中国工商银行深圳市分行"]`)
  await sel[0].tap()
  
  sel = await page.$x('//span[string()="客户身份*"]/../select')
  await sel[0].select("1")  // select 选中下面的option 值为0

  let uploadImg = await page.$x(`//div[contains(text(), "上传凭证信息")]//div[contains(@class, "img_select_leftx")]/img`)

  await uploadImg[0].evaluate(ele => { //滚动到上传图片那
    console.log('ele', ele)
    ele.scrollIntoView()
  })

  let uploadInput = await page.$x(`//div[contains(text(), "上传凭证信息")]//input`)
  uploadInput = uploadInput[0]
  await uploadInput.uploadFile(`C:\\Users\\chenzemin\\Pictures\\icon-5.png`) // 上传文件
  // await uploadImg[0].tap()

  console.log('done')
  

})()