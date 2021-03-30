const pupHelp = require('./util/pupHelp')
const util = require('../puppeteer/util/index')
const path = require('path')
const https = require('https')
const fs = require('fs')

function getPromise(url) {
  return new Promise((resolve) => {
 
     https.get(url, (res) => {
       // console.log('in http get')
       let rawData = '';
 
       res.on('data', (chunk) => {
         // console.log('in http data')
         rawData += chunk;
       })
 
       res.on('end', () => {
         // console.log('in http end')
         resolve(rawData)
       });
 
     }).on('error', (e) => {
       resolve(false) // 如果 用reject 是抛出错误
     });
 
   })
 }

;(async function () {
  util.existsFolder(path.join(__dirname, './captchas/'))
  let url = `https://qmobile.hdfax.com/common/getCaptcha`
  let outpath = path.join(__dirname, `./captchas/`)
  let index = 0
  if (fs.existsSync(path.join(__dirname, `./captchas/index.txt`))) {
    index = fs.readFileSync(path.join(__dirname, `./captchas/index.txt`), 'utf-8')
    index = Number(index)
  }
  while(true) { //无限下载

    let res = await getPromise(url)
    res = JSON.parse(res)
    let {captcha} = res
    // captcha = `data:image/jpg;base64,${captcha}` 
    let dataBuffer = Buffer.from(captcha, 'base64')
   
    index++
    fs.writeFileSync(path.join(__dirname, `./captchas/index.txt`), index + '')
    fs.writeFileSync(outpath + index + '.jpg', dataBuffer)
    fs.writeFileSync(outpath + index + '.txt', captcha)
    console.log(captcha)
  }
})()
