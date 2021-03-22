const express = require('express')
const api = express.Router()
const bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

 const CouponStatus = {
  'none': -1,
  'over': 0,
  'can': 1,
  'have': 2,
}

 const TipStatus = {
  'willStart': 0,
  'get': 1,
  'over': 2,
  'zero': 3,
}

api.post('/list', (req, res) => {
  let list = [
    { id: '1', title: '38女王节，福利大派送！38女王节，福利大派送！', startDate: '2021/03/01', endDate: '2021/03/08', status: CouponStatus.have },
    { id: '2', title: '38女王节，福利大派送', startDate: '2021/03/01', endDate: '2021/03/08', status: CouponStatus.can  },
    { id: '3', title: '38女王节，福利大派送', startDate: '2021/03/02', endDate: '2021/03/09', status: CouponStatus.can  },
    { id: '4', title: '38女王节，福利大派送', startDate: '2021/03/04', endDate: '2021/03/18', status: CouponStatus.can  },
    { id: '5', title: '22神秘节，福利大派送', startDate: '2021/02/01', endDate: '2021/02/08', status: CouponStatus.over },
    { id: '6', title: '22神秘节，福利大派送', startDate: '2021/02/03', endDate: '2021/02/09', status: CouponStatus.none },
  ]

  res.json({
      list,
      resultCode: "1000",
      resultMsg: "成功"
    })
})

api.post('/requestCoupon', jsonParser, (req, res) => {
  let status = parseInt(Math.random(0, 1) * 4)

  res.json({
    resultCode: '1000',
    mresultMsg: '成功',
    result: status
  })
})

api.post('/my', jsonParser, (req, res) => {
  let myList =  [
    { id: '1', title: '38女王节，福利大派送', desc: '华为watch gt2 智能手表', startDate: '2021/03/01', endDate: '2021/03/08', status: 1 },
    { id: '2', title: '38女王节，福利大派送', desc: '0.2%加息券', startDate: '2021/03/01', endDate: '2021/03/08', status: 1  },
    { id: '3', title: '38女王节，福利大派送', desc: '500¥', startDate: '2021/03/02', endDate: '2021/03/09', status: 1  },
    { id: '4', title: '38女王节，福利大派送', desc: '京东购物卡', startDate: '2021/03/04', endDate: '2021/03/18', status: 1  },
    { id: '5', title: '22神秘节，福利大派送', desc: '京东购物卡', startDate: '2021/02/01', endDate: '2021/02/08', status: 0 },
    { id: '6', title: '22神秘节，福利大派送', desc: '京东购物卡', startDate: '2021/02/03', endDate: '2021/02/09', status: 0 },
  ]

  let rnd = Math.random()
  if (rnd > 0.5) {
    myList = []
  }

  // setTimeout(() => {
    res.json({
      list: myList,
      resultCode: "1000",
      resultMsg: "成功"
    })  
  // }, 1000);

  
})

module.exports = api