const fs = require('fs');
const gm  = require('gm') //安装 ImageMagick、GraphicsMagick、ghostscript, 然后重启
const util = require('../util/index')
const path = require('path')
/**
 * 合并 folder 文件夹下的所有图片 到output 按时间命名
 */
function main (outputFilePath) { // ouputFilePath  导出的文件路径
  let fromFolder = path.resolve(__dirname, '../folder') //提取目录
  let files = []; //文件

  if (fs.existsSync(fromFolder)) { //如果提取目录存在
    files = fs.readdirSync(fromFolder); //同步读取所有文件
    files = files.sort((a, b) => {
      return Number(a.split('.')[0]) - Number(b.split('.')[0]) // 按数字大小增序
    }).filter(v => {
      return v != '.gitkeep' //过滤 .gitkeep 文件
    })

    let gmImg;
    files.forEach((file, index) => {
      let curPath = fromFolder + '/' + file;
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
    if (outputFilePath) { // 如果有传入 导出文件路径
      console.log('gmimg', outputFilePath)
      gmImg.write(outputFilePath, (err) => {
        console.log(err)
      })
    } else {
      gmImg.write( path.resolve(__dirname,  '../output/' + d + '.png'), (err) => {
        console.log(err)
      })
    }
    
  }
}

module.exports = {
  do: main
}