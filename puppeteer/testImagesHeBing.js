const fs = require('fs');
const images = require('images') //windows 有缺陷，只能最大10000像素

// images.setLimit(60000, 60000) 设置无用

let path = 'folder'
let files = [];
if (fs.existsSync(path)) {
  files = fs.readdirSync(path);
  files = files.sort((a, b) => {
    return Number(a.split('.')[0]) - Number(b.split('.')[0])
  }).filter(v => {
    return v != '.gitkeep'
  })
  let s = 12 //files.length
  let {width, height} = images(path + '/' + files[0]).size()
  console.log(width, height * s)
  console.log(files.length)
  let imgResult = images(width, height * s)
  // imgResult.draw(images('folder/1.png'), 0, 0)
  files.forEach((file, index) => {
    if (index >= s) return;
    let curPath = path + '/' + file;
    if (fs.statSync(curPath).isDirectory()) {
    } else {
      console.log(file, images(curPath).size())
      imgResult.draw(images(curPath), 0, height * index)
    }
  })
  var d = new Date().getTime()
  // imgResult.size(2000)
  imgResult.save('output/' + d + '.jpg')
}