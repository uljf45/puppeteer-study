const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const pupHelp = require('./util/pupHelp')

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
  let outPath = path.resolve(__dirname, 'browserWSEndpoint.txt')
  fs.writeFileSync(outPath, browserWSEndpoint) //将该浏览器的ws endpoint 保存到文件

  const page = await browser.newPage()

  await page.emulate(puppeteer.devices["iPhone X"]) //模拟 手机

  await page.goto(site, {
    waitUntil: 'load'
  })

  await pupHelp.mimicPhone(page) // 模拟 f12 手机模式

  const simpleType = pupHelp.simpleType(page) //提取 获取元素并填写
  const simpleTap = pupHelp.simpleTap(page) //提取 获取元素并点击
  const simpleWaitThenType = pupHelp.simpleWaitThenType(page) //提取 等待元素并填写
  const simpleWaitThenTap = pupHelp.simpleWaitThenTap(page) //提取 等待元素并点击
  

  let resp = await page.waitForResponse(response => /op_query_all_declaration_form/.test(response.url()))
  let respJson = await resp.json()
  // console.log(respJson)
  if (respJson.resultCode != '1000') { //请求失败跳转到登录
    let captureRequest =  await page.waitForRequest(request => /getCaptcha/.test(request.url())) // 等待获取验证码

    let captureResponse = await page.waitForResponse(response => /getCaptcha/.test(response.url()))
    // let txt = await captureResponse.text()
    // console.log(txt)

    await simpleType(`//input[@placeholder="输入手机号"]`, "15537145866")

    await simpleType(`//input[@placeholder="输入验证码"]`, "1234")
  
    let verifyBtn = await page.$x(`//button[string()="验证手机号"]`)
    await verifyBtn[0].tap()
    try {
      await page.waitForResponse(response => /isRegistered/.test(response.url())) //如果验证接口返回出错
    } catch (e) {
      await verifyBtn[0].tap() //再次点击验证按钮
    }
  
    await page.waitForNavigation() // 等待跳转成功
  

    await simpleWaitThenType(`//input[@placeholder="输入登录密码"]`, 'lys123456')

    await simpleTap(`//button[string()="登录"]`)

    try {
      let rep = await page.waitForResponse(response => /login/.test(response.url()))
      // console.log(rep)
    } catch(e) {
      await page.goto(site) //登录接口返回出错, 其实已经登陆成功， 刷新页面
    }
    // await page.waitForNavigation({
    //   waitUntil: 'domcontentloaded'
    // })
  } else {
    // await page.waitForNavigation({
    //   waitUntil: 'domcontentloaded'
    // })
  }

  await simpleWaitThenTap(`//li[@class="prev_list_inner"]/div[string()="填写报单"]`)

  await page.waitForNavigation()

  let [respBankInfo, respSellableProduct] = await Promise.all([  //判断多个接口请求
    page.waitForResponse(resp => /op_query_recommender_bank_info/.test(resp.url())),
    page.waitForResponse(resp => /op_query_sellable_resv_prod_quote_by_group_id/.test(resp.url())),
  ])

  let spRes = await respSellableProduct.json()
  let prdName = spRes["resvProds"][0]["productName"]
  // console.log(prdName)

  await simpleWaitThenTap(`//span[string()="单据类型*"]/../div`)

  await simpleWaitThenTap(`//div[@class="modalContentLeft"]//span[string()="普通单据13"]`)

  await simpleTap(`//div[@class="modalFooter"]/span[string()="确定"]`)

  await simpleType(`//input[@placeholder="请填写投顾姓名"]`, '毛颜')
  await simpleType(`//input[@placeholder="请填写客户手机号"]`, '13632545135')
  await simpleType(`//input[@placeholder="请填写客户姓名"]`, '陈泽敏')
  await simpleType(`//input[@placeholder="请填写证件号码"]`, '440582199005161810')

  try {
    page.waitForXPath('//div[@class="pop_name" and @style=""]/button').then(async () => { //异步执行, 不使用await await会阻塞主线程
      let popNameKeHu = await page.$x('//div[@class="pop_name"]/button')
      await popNameKeHu[0].tap()
    })
  } catch(err) {

  }

  let sel = await page.$x('//span[string()="是否有推荐人*"]/../select') // select下拉框选择
  await sel[0].select("0")  // select 选中下面的option 值为0

  await simpleType(`//input[@placeholder="请输入产品名称"]`, prdName)
  await simpleTap(`//li[string()="${prdName}"]`)

  await simpleType(`//input[@placeholder="请输入金额"]`, '11')

  await simpleType(`//span[string()="银行卡号*"]/../input[@placeholder="请填写银行卡号"]`, '123456789123456789')

  await simpleType(`//input[@placeholder="请输入银行名称"]`, '中国工商银行', {
    delay: 50
  })

  await simpleWaitThenTap(`//li[string()="中国工商银行"]`)

  console.log('select bank name done')

  await page.waitForResponse(resp => /op_query_bank_province_list/.test(resp.url()))

  await simpleType(`//input[@placeholder="请输入开户行省份"]`, '广东省', {
    delay: 50
  })

  await simpleWaitThenTap(`//li[string()="广东省"]`)

  console.log('select province done')

  await page.waitForResponse(resp => /op_query_bank_city_list/.test(resp.url()))

  await simpleType(`//input[@placeholder="请输入开户行城市"]`, '深圳市', {
    delay: 50
  })

  await simpleWaitThenTap(`//li[string()="深圳市"]`)

  await page.waitForResponse(resp => /op_query_bank_branch_list/.test(resp.url()))

  await simpleType(`//input[@placeholder="请输入开户行名称"]`, '中国工商银行深圳市分行', {
    delay: 50
  })

  await simpleWaitThenTap(`//li[string()="中国工商银行深圳市分行"]`)

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

  console.log('done')
  
})()