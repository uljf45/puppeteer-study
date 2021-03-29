const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const pupHelp = require('./util/pupHelp')

;(async function () {
  let filePath = path.join(__dirname, 'browserWSEndpoint.txt')
  const browserWSEndpoint = fs.readFileSync(filePath, { //从文件里读取ws endpoint
    encoding: 'utf-8'
  })
  console.log(browserWSEndpoint)

  const browser = await puppeteer.connect({browserWSEndpoint}) //连接到已经存在的浏览器

  const page = await browser.newPage()

  // await page.emulate(puppeteer.devices["iPhone X"]) //模拟 手机
  // await pupHelp.mimicPhone(page) //模拟f12 切换手机模式

  await page.emulate(puppeteer.devices["Blackberry PlayBook landscape"])
  await page.goto(`https://www.baidu.com`)

  await page.evaluate(() => {
    let div = document.createElement('div')
    div.style.position = 'absolute'
    div.style.width = '100px'
    div.style.height = '100px'
    div.style.background = 'red'
    div.style.left = 0
    div.style.top = 0
    div.style.zIndex = 999
    document.body.appendChild(div)
    div.addEventListener('mousedown', (event) => {
      console.log(event)
      console.log('mousedown')
      let x = event.pageX
      let y = event.pageY
      div.style.top = y
      div.style.left = x

      function move (event) {
        div.style.top = event.pageY + 'px'
        div.style.left = event.pageX + 'px'
        return false
      }

      div.addEventListener('mousemove', move)

      function stop (event) {
        div.removeEventListener('mousemove', move)
        div.removeEventListener('mouseup', stop)
        return false
      }

      div.addEventListener('mouseup', stop)
      return false

    })

  })

  await page.bringToFront()
  await page.mouse.move(1, 1)
  await page.mouse.down()
  await page.mouse.move(0, 400, {
    steps: 1000
  })
  await page.mouse.move(400, 400, {
    steps: 1000
  });
  await page.mouse.move(400, 0, {
    steps: 1000
  });
  await page.mouse.move(0, 0, {
    steps: 1000
  });
  await page.mouse.up();

  // page.on('dialog', async dialog => { //监听页面 alert confirm prompt
  //   console.log(dialog.message())
  //   var q = await dialog.accept('sdf')  //确认 当是 prompt 时 返回输入的文本为'sdf' 其他类型文本无用
  //   // await dialog.dismiss() //取消
  //   console.log(q)
  // })

})();