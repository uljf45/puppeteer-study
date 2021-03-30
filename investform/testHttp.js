const http = require('http')
const pupHelp = require('./util/pupHelp')

;(async function () {
  let url = await pupHelp.isRuning()
  console.log(url)
  // new Promise((resolve, reject) => {
  //   http.get(url, (res) => {
  //     console.log(url)
  //     console.log('in http get')
  //     res.on('end', () => {
  //       console.log('in http get end')
  //       resolve(true)
  //     })
  //   }).on('error', (e) => {
  //     resolve(false)
  //   });
  // })
})()