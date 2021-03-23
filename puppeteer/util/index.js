const fs = require('fs');
const path = require('path')

//延时函数
function sleep(delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(1);
      } catch (e) {
        reject(0);
      }
    }, delay);
  });
};

//格式化时间
function fmtDate(date, fmt) { 
  fmt = fmt || 'yyyy-MM-dd hh:mm:ss'
  date = new Date(date)

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "")).substr(4 - RegExp.$1.length);
  }

  var o = {
    "M+": date.getMonth() + 1,                 //月份
    "d+": date.getDate(),                    //日
    "h+": date.getHours(),                   //小时
    "m+": date.getMinutes(),                 //分
    "s+": date.getSeconds(),                 //秒
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
    "S": date.getMilliseconds()             //毫秒
  };

  Object.keys(o).forEach(k => {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt .replace(RegExp.$1, (o[k] + '').padStart(2, 0))
    }
  })
  return fmt
}


function getCurDateStrForFile(fmt) {
  var d = new Date()
  d = fmtDate(d, 'yyyy-MM-dd hh-mm-ss')
  return d
}

// 删除path下的所有文件
function delDir(path) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach((file, index) => {
      let curPath = path + '/' + file;
      if (fs.statSync(curPath).isDirectory()) {
        delDir(curPath) //递归删除文件夹
      } else {
        fs.unlinkSync(curPath) //删除文件
      }
    })
  }
};

async function existsFolder (realPath) {
  const absPath = path.resolve(__dirname, realPath);
  console.log('abs', absPath)
  fs.stat(absPath, function (err, stats) {
    if (!fs.stats) {
      fs.mkdir(absPath, { recursive: true }, err => {
        if (err) throw err;
      });
    }
  })
};

module.exports = {
  sleep,
  delDir,
  fmtDate,
  getCurDateStrForFile,
  existsFolder
}