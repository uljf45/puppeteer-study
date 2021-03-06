const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const pupHelp = require('./util/pupHelp')
const datas = require('./jsonFile/index')

let site = 'https://qpromotion.hdfax.com/v2/m/investmentFormInput/index.html'

let target = process.argv[2]
let dataWhere = process.argv[3]
switch(target) {
  case 'dev':
    site = 'http://dev.hdfax.com/v2/m/investmentFormInput/index.html'
    break
  case 'q':
    site = 'https://qpromotion.hdfax.com/v2/m/investmentFormInput/index.html'
    break
}

let data = datas.data1 // 获取 order json 数据
if (dataWhere) {
  data = datas[dataWhere]
}

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
  await page.setViewport({
    width: 375,
    height: 812,
    isMobile: true,
  })
  await page.emulate(puppeteer.devices["iPhone 7"]) //模拟 手机

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
  async function login() {
    await simpleType(`//input[@placeholder="输入手机号"]`, "15537145866")
    let img =  await page.$x(`//img[@name="image"]`)
    img = img[0]
    let src = await img.evaluate(img => img.src)

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
  }
  
  if (respJson.resultCode != '1000') { //请求失败跳转到登录
    let captureRequest =  await page.waitForRequest(request => /getCaptcha/.test(request.url())) // 等待获取验证码

    let captureResponse = await page.waitForResponse(response => /getCaptcha/.test(response.url()))
    // let txt = await captureResponse.text()
    // console.log(txt)

    await login()
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

  console.log('page.waitForNavigation')

  let [respBankInfo, respSellableProduct] = await Promise.all([  //判断多个接口请求
    page.waitForResponse(resp => /op_query_recommender_bank_info/.test(resp.url())),
    page.waitForResponse(resp => /op_query_sellable_resv_prod_quote_by_group_id/.test(resp.url())),
    page.waitForResponse(resp => /op_query_all_valid_bill_type/.test(resp.url())),
    page.waitForResponse(resp => /op_query_all_cert_type/.test(resp.url())),
  ])

  console.log('respSellableProduct')

  let spRes = await respSellableProduct.json()
  let prdName = spRes["resvProds"][0]["productName"]
  // console.log(prdName)

  async function fill() {
    await simpleWaitThenTap(`//span[string()="单据类型*"]/../div`)

    await simpleWaitThenTap(`//div[@class="modalContentLeft"]//span[string()="普通单据13"]`)
  
    await simpleTap(`//div[@class="modalFooter"]/span[string()="确定"]`)
  
    await simpleType(`//input[@placeholder="请填写投顾工号"]`, data.investmentAdviserNo)
    await simpleType(`//input[@placeholder="请填写客户手机号"]`, data.phoneNo)
    await simpleType(`//input[@placeholder="请填写客户姓名"]`, data.userName)
    await simpleType(`//input[@placeholder="请填写证件号码"]`, data.idNo)
  
    let sel = await page.$x('//span[string()="是否有推荐人*"]/../select') // select下拉框选择
    await sel[0].select(data.hasRecommender + '' || '')  // select 选中下面的option 值为0
  
    await simpleWaitThenType(`//input[@placeholder="请填写推荐人姓名"]`, data.recommender)
    await simpleType(`//input[@placeholder="请填写推荐人手机号"]`, data.recommenderPhoneNo)
    await simpleType(`//input[@placeholder="请填写推荐人证件号"]`, data.recommenderIdNo)
    await simpleType(`//input[@placeholder="请填写银行卡号"]`, data.recommenderBankNo)

    // let resp = await page.waitForResponse(resp => /op_query_hd_emp_info/.test(resp.url()))
    // let respJson = await resp.json()
    // if (respJson.resultCode == "04600000018") { //不存在
    //   let toastEl = await page.waitForSelector('#toastSec')
    //   await toastEl.evaluate(v => {
    //     v.remove()
    //   })
    // }

    sel = await page.$x('//span[string()="推荐人开户行*"]/../select') // select下拉框选择
    await sel[0].select(data.recommenderBankAccountName + '')  // select 选中下面的option 值为0

    await simpleType(`//input[@placeholder="请填写开户行支行名称"]`, data.recommenderBankBranchName)


    await simpleType(`//input[@placeholder="请输入产品名称"]`, data.productName)
    await simpleWaitThenTap(`//li[string()="${data.productName}"]`)
  
    await simpleType(`//input[@placeholder="请输入金额"]`, data.amount)
  
    await simpleType(`//span[string()="银行卡号*"]/../input[@placeholder="请填写银行卡号"]`, data.bankCardNo)
  
    await simpleType(`//input[@placeholder="请输入银行名称"]`, data.bankName, {
      delay: 50
    })
  
    await simpleWaitThenTap(`//li[string()="${data.bankName}"]`)
  
    console.log('select bank name done')
  
    await page.waitForResponse(resp => /op_query_bank_province_list/.test(resp.url()))
  
    await simpleType(`//input[@placeholder="请输入开户行省份"]`, data.bankProvince, {
      delay: 50
    })
  
    await simpleWaitThenTap(`//li[string()="${data.bankProvince}"]`)
  
    console.log('select province done')
  
    await page.waitForResponse(resp => /op_query_bank_city_list/.test(resp.url()))
  
    await simpleType(`//input[@placeholder="请输入开户行城市"]`, data.bankCity, {
      delay: 50
    })
  
    await simpleWaitThenTap(`//li[string()="${data.bankCity}"]`)
  
    await page.waitForResponse(resp => /op_query_bank_branch_list/.test(resp.url()))
  
    await simpleType(`//input[@placeholder="请输入开户行名称"]`, data.bankAcctName, {
      delay: 50
    })
  
    await simpleWaitThenTap(`//li[string()="${data.bankAcctName}"]`)
  
    sel = await page.$x('//span[string()="客户身份*"]/../select')
    await sel[0].select(data.userIdentity + '')  // select 选中下面的option 值为0
  
    let uploadImg = await page.$x(`//div[contains(text(), "上传凭证信息")]//div[contains(@class, "img_select_leftx")]/img`)
    await uploadImg[0].evaluate(ele => { //滚动到上传图片那
      console.log('ele', ele)
      ele.scrollIntoView()
    })
  
    let uploadInput = await page.$x(`//div[contains(text(), "上传凭证信息")]//input`)
    uploadInput = uploadInput[0]
    await uploadInput.uploadFile(`C:\\Users\\chenzemin\\Pictures\\icon-5.png`) // 上传文件
  
    try {
      page.waitForXPath('//div[@class="pop_name" and @style=""]/button', {
        timeout: 3000
      }).then(() => { //异步执行, 不使用await await会阻塞主线程
        console.log('press ok')
        page.$x('//div[@class="pop_name"  and @style=""]/button').then(el => {
          el[0].boundingBox().then(v => {
            v && el[0].tap() //此处tap 可能会与页面其他元素的tap相互影响， 因此放在最后执行
          })
        })
      }).catch(err => {
        console.log('press ok timeout')
      })
    } catch(err) {
  
    }
  }

  await fill()

  page.on('console', async msg => {
    let word = msg.text()
    if (/^pup fill/.test(word)) {
      await fill()
    }
    if (/^pup login/.test(word)) {
      await login()
    }
  })

  

  console.log('done')
  
})()