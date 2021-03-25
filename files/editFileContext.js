const fs = require('fs')
const path = require('path')

const newList = []
const where = `C:\\Users\\chenzemin\\Desktop\\极客时间\\趣谈网络协议`
let files = fs.readdirSync(where)
files.forEach(v => {
  if (/html$/.test(v)) { // 如果是html文件
    let full = path.join(where, v)
    console.log(full)
    
    fs.readFile(full, 'utf8', function (err, data) {
      if (err) throw err
      let lines = data.split('\n')
      let idx = lines.findIndex(v => {
        return v.indexOf('main.js') >= 0
      })
      let ctx = lines[idx]
      console.log(ctx)
      if (/<!--/.test(ctx)) {
        
      } else {
        lines[idx] = `<!-- ${ctx} -->`
        fs.writeFileSync(full, lines.join('\n'), 'utf8')
      }
    })
  }
})

