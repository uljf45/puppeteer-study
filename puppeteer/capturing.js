const puppeteer = require("puppeteer");
const util = require('./util/index');
const joinPic = require('./util/joinPic');
const startShot = require('./util/startShot');

let url = process.argv[2];

(async () => {
  if (url) {
    let callbacks = {}
    if (/^https{0,1}:\/\/juejin.cn/.test(url)) {
      callbacks.onload = () => { // 掘金网站首页进入底部浮框
        document.querySelector('.recommend-box').remove();
      }  
    }

    if (/^https{0,1}:\/\/www.163.com/.test(url)) {
      callbacks.onload = () => { // 网易163网站首页进入底部菜单
        document.querySelector('.ntes_nav_wrap').remove();
      }  
    }
    startShot.do(process.argv[2], callbacks)
  }
})();