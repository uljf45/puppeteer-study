const fs = require('fs');
// const images = require('images') //windows 有缺陷，只能最大10000像素
const gm  = require('gm')

// images.setLimit(60000, 60000) 设置无用

let path = 'folder' //导出目录
let files = []; //文件

if (fs.existsSync(path)) { //如果导出目录存在
  files = fs.readdirSync(path); //同步读取所有文件
  files = files.sort((a, b) => {
    return Number(a.split('.')[0]) - Number(b.split('.')[0]) // 按数字大小增序
  }).filter(v => {
    return v != '.gitkeep' //过滤 .gitkeep 文件
  })
  // let s = 12 //files.length
  // let {width, height} = images(path + '/' + files[0]).size()
  // console.log(width, height * s)
  // console.log(files.length)
  // let imgResult = images(width, height * s)
  // imgResult.draw(images('folder/1.png'), 0, 0)
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
      // console.log(file, images(curPath).size())
      // imgResult.draw(images(curPath), 0, height * index)
    }
  })
  var d = new Date().getTime()
  // imgResult.size(2000)
  console.log(gmImg)
  gmImg.write('./output/' + d + '.png', (err) => {
    console.log(err)
  })
}