const puppeteer = require('puppeteer');

/**
 * 
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
  await client.send('Network.setBlockedURLs', { // 禁止某些js文件
    urls: ["https://hm.baidu.com/hm.js?e994280905f4e78db10dfbb739e87ee0"]
  })
  //cdp session 模拟浏览器打开手机模式 end
}
