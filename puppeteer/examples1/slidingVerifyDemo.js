const puppeteer = require('puppeteer');

(async () => {
  let waitUntilStr = 'domcontentloaded';

  let headlessFlag = false;
  
  let args = [
    '--no-sandbox',
    '--disable-infobars ', // don't show information bar
    '--window-size=1920,1080', // resize window view port size
    '--lang=zh-CN',
    '--disable-dev-shm-usage'
  ];
  
  const browser = await puppeteer.launch({
    defaultViewport: { width: 1400, height: 800 },
    ignoreHTTPSErrors: true,
    headless: headlessFlag,
    args
  });
  
  const page = await browser.newPage();
  let requestUrl = `https://cnblogs.com/`
  
  await page.goto(requestUrl, {
    timeout: 10000,
    waitUntil: 'load'
  }).catch(err => {})
  

  
  await page.evaluate(() => {
    let loginBtn = document.querySelectorAll('#navbar_login_status .navbar-anonymous')[1]
    loginBtn.click()
  })

  await page.waitForNavigation({
    timeout: 5000
  });

  await page.type('#mat-input-0', 'uljf45')
  await page.type('#mat-input-1', 'hd123456')
  await page.click('[mat-flat-button]')
  var slide_btn = await page.waitForSelector('.geetest_panel_box geetest_panelshowslide', {timeout: 5000})
  if (slide_btn) {
    
  }

})();
