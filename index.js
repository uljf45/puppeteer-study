const cookieParser = require("cookie-parser")
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const port = 3000
const couponApis = require('./api/coupon.js')
const path = require('path')

app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin); //当允许携带cookies此处的白名单不能写’*’
  res.header('Access-Control-Allow-Headers','content-type,Content-Length, Authorization,Origin,Accept,X-Requested-With'); //允许的请求头
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT'); //允许的请求方法
  res.header('Access-Control-Allow-Credentials',true);  //允许携带cookies
  next();
});

app.use(cookieParser())

var jsonParser = bodyParser.json()

const low = require('lowdb')

const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({
  posts: [], user: {}, count: 0
}).write()

app.use('/coupon', couponApis)


let count = 0;

app.get('/', (req, res) => {
  count++;
  let c = db.get('count').value()
  db.update('count', n => n + 1).write()
  res.send(c + '');
})

function checkUser(name, token) {
  if (name == 'czm' && token == '123456') {
    return true
  }
  return false
}

app.get('/menus', (req, res) => {
  if (checkUser(req.cookies.name, req.cookies.token)) {
    res.json([
      {name: "首页", target: '/'},
      {name: "新闻", target: '/news'},
      {name: '关于', target: '/about'},
      {name: '展示', target: '/show'},
      {name: '设置', target: '/setting'},
    ])
  } else {
    res.json([
      {name: "首页", target: '/'},
      {name: "新闻", target: '/news'},
      {name: '关于', target: '/about'},
      {name: '展示', target: '/show'},
      {name: '登录', target: '/login'},
      {name: '注册', target: '/register'},
    ])
  }
  
})

app.get('/news', (req, res) => {
  console.log('/news', new Date())
  res.json([
    {title: '新闻1', content: '新闻1内容1内容1内容'},
    {title: '新闻2', content: '新闻2内容2内容2内容'},
    {title: '新闻3', content: '新闻3内容3内容3内容'},
    {title: '新闻4', content: '新闻4内容4内容4内容'},
    {title: '新闻4', content: '新闻4内容4内容4内容'},
    {title: '新闻5', content: '新闻5内容5内容5内容'},
    {title: '新闻6', content: '新闻6内容6内容6内容'},
  ])
})


function checkAuth(auth) {
  if (auth) return true
  return false
}

app.get('/getCount', (req, res) => {
  let auth = req.headers['authorization']
  let valid = checkAuth(auth)
  if (!valid) {
    res.json({
      code: '401'
    })
    return
  }
  res.send(db.get('count').value() + '')
})

app.post('/logout', (req, res) => {
  res.json({
    msg: '退出成功'
  })
})

app.post('/login', jsonParser, (req, res) => {
  res.json({
    msg: '登陆成功',
    code: '1000',
    auth: 'czm123456'
  })
})

app.get('/eif-omc-web/ftc/regionalCompanyReport/exportReportRosterTemplate', (req, res) => {
  let p = path.resolve(__dirname, "./static/测试.xlsx")
  res.download(p, "测试.xlsx")
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})