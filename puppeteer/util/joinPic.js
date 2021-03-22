const fs = require('fs');
const gm  = require('gm') //安装 ImageMagick、GraphicsMagick、ghostscript, 然后重启
const util = require('../util/index')

/**
 * 合并 folder 文件夹下的所有图片 到output 按时间命名
 */
function main () {
  let path = 'folder' //导出目录
  let files = []; //文件

  if (fs.existsSync(path)) { //如果导出目录存在
    files = fs.readdirSync(path); //同步读取所有文件
    files = files.sort((a, b) => {
      return Number(a.split('.')[0]) - Number(b.split('.')[0]) // 按数字大小增序
    }).filter(v => {
      return v != '.gitkeep' //过滤 .gitkeep 文件
    })

    let gmImg;
    files.forEach((file, index) => {
      let curPath = './' + path + '/' + file;
      if (fs.statSync(curPath).isDirectory()) { //如果是目录
      } else { //如果是文件
        if (index == 0) {
          gmImg = gm(curPath)
          return
        }
        gmImg = gmImg.append(curPath)

      }
    })
    var d = new Date()
    d = util.fmtDate(d, 'yyyy-MM-dd hh-mm-ss')
    gmImg.write('./output/' + d + '.png', (err) => {
      console.log(err)
    })
  }
}

module.exports = {
  do: main
}