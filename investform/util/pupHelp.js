const puppeteer = require('puppeteer');
const path = require('path')
const fs = require('fs');
const http = require('http');

/**
 * 获取 ws end point
 * @returns 
 */
function getWsEndpoint () {
  let filePath = path.join(__dirname, '../browserWSEndpoint.txt')
  const browserWSEndpoint = fs.readFileSync(filePath, { //从文件里读取ws endpoint
    encoding: 'utf-8'
  })
  return browserWSEndpoint
}

/**
 * 封装 http get 请求 为 promise
 * @param {String} url 
 * @returns async function
 */
function getPromise(url) {
 return new Promise((resolve) => {

    http.get(url, (res) => {
      // console.log('in http get')
      let rawData = '';

      res.on('data', (chunk) => {
        // console.log('in http data')
        rawData += chunk;
      })

      res.on('end', () => {
        // console.log('in http end')
        resolve(true)
      });

    }).on('error', (e) => {
      resolve(false) // 如果 用reject 是抛出错误
    });

  })
}

/**
 * 通过 ws end point 获取浏览器是否在运行
 * @returns 
 */
exports.isRuning = async function () {
  // ws://127.0.0.1:56652/devtools/browser/f5d3dd8c-e615-44b1-89ad-f788e64491ae
  let wsPoint = getWsEndpoint()
  if (!wsPoint) return false
  if (/^ws:\/\/([0-9.:]+)\//.test(wsPoint)) {
    let url = 'http://' + RegExp.$1 + '/json'
    let res = await getPromise(url)
    return res && url
  }

  return false
}

/**
 * 连接到ws end point 所指的浏览器， 如果不存在则新建浏览器
 * @returns 
 */
exports.connectToExist = async function () {
  const browserWSEndpoint = getWsEndpoint()
  let exists = await exports.isRuning()
  if (!exists) {
    let browser = await puppeteer.launch({
      headless: false
    })
    return browser
  }
  let browser
  try {
    browser = await puppeteer.connect({browserWSEndpoint}) //连接到已经存在的浏览器
  } catch (e) {
    console.log('browser', 'none')
  }
  return browser
}

/**
 * cdp session 模拟浏览器打开手机模式 start
 * @param {puppeteer.Page} page 
 */
exports.mimicPhone =  async function (page) {
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
  console.log('before setBlockedURLs')
  await client.send('Network.setBlockedURLs', { // 禁止某些js文件
    urls: [
      "https://hm.baidu.com/hm.js?e994280905f4e78db10dfbb739e87ee0",
      "static.sensorsdata.cn/sdk/1.9.11/sensorsdata.min.js"
    ]
  })
  //cdp session 模拟浏览器打开手机模式 end
}

/**
 * @param {puppeteer.Page} page 
 * @returns async function
 * 
 * @example
 * const xpath = `//div`
 * const simpleType = pupHelp.simpleType(page)
 * await simpleType(xpath, 'some words')
 */
exports.simpleType = function (page) {
  return async function (xpath, txt, options) {
    let el = await page.$x(xpath)
    await el[0].type(txt, options)
  }
}

/**
 * @param {puppeteer.Page} page 
 * @returns async function
 * 
 * @example
 * const xpath = `//div`
 * const simpleWaitThenType = pupHelp.simpleWaitThenType(page)
 * await simpleWaitThenType(xpath, 'some words')
 */
exports.simpleWaitThenType = function (page) {
  return async function (xpath, txt) {
    await page.waitForXPath(xpath)
    let el = await page.$x(xpath)
    await el[0].type(txt)
  }
}

/**
 * 
 * @param {puppeteer.Page} page 
 * @returns async function
 * @example
 * const xpath = `//div`
 * const simpleTap = pupHelp.simpleTap(page)
 * await simpleTap(xpath)
 */
exports.simpleTap = function (page) {
  return async function (xpath) {
    let el = await page.$x(xpath)
    await el[0].tap()
  }
}

/**
 * 
 * @param {puppeteer.Page} page 
 * @returns async function
 * @example
 * const xpath = `//div`
 * const simpleWaitThenTap = pupHelp.simpleWaitThenTap(page)
 * await simpleWaitThenTap(xpath)
 */
 exports.simpleWaitThenTap = function (page) {
  return async function (xpath) {
    await page.waitForXPath(xpath)
    let el = await page.$x(xpath)
    await el[0].tap()
  }
}

