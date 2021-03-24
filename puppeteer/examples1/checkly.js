// https://github.com/checkly/puppeteer-examples

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const {promisify} = require('util')

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile);

;(async () => {
  async function alert () {
    const browser = await puppeteer.launch({
      headless: false
    })
    const page = await browser.newPage()
  
    await page.goto('https://www.baidu.com')
    page.on('dialog', async dialog => {
      console.log(dialog.message())
      await dialog.dismiss()
    })
    await page.evaluate(() => {
      alert('This message is inside an alert box')
    })
    await page.waitForTimeout(1000)
    await browser.close()
  }

    const browser = await puppeteer.launch({
      headless: false
    })

    const page = await browser.newPage()

    await page.setViewport({
      width: 1200,
      height: 800
    })
    await page.goto('https://www.163.com')
    const imageHref = await page.evaluate((sel) => {
      return document.querySelector(sel).getAttribute('src')
    }, '.qrcode-img img')

    console.log(imageHref)
    const viewSource = await page.goto('https:' + imageHref)

    const buffer = await viewSource.buffer()

    await writeFileAsync(path.join(__dirname, 'checkly.jpg'), buffer)

    console.log('The file was saved!')
  
    var buf = await readFileAsync(path.join(__dirname, 'checkly.jpg'))

    let result = await page.evaluate(async (buf) => {
      window.buf = buf
      console.log(buf)
      function arrayBufferToBase64( buffer ) {
        var binary = '';
        var bytes = new Uint8Array( buffer );
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return window.btoa( binary );
      }
      // async function readFile (buf) {
      //   return new Promise(function (resolve, reject) {
      //     var reader = new FileReader()
      //     reader.readAsDataURL(new Blob(buf.data, {
      //       type: 'image/jpg'
      //     }))
      //     reader.onload = function (e) {
      //       var base64Data = reader.result
      //       resolve(base64Data)
      //     }
      //   })
      // }

      // let res = await readFile(buf)
      let res = arrayBufferToBase64(buf.data)
      res = 'data:image/jpg;base64,' + res
      document.querySelector('img').src = res
      return res
    }, buf)

    await writeFileAsync(path.join(__dirname, 'checkly.txt'), result)
    
    console.log('The file was read!')
  
})();