const express = require('express')
const api = express.Router()
const bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const fs = require('fs')
const path = require('path')
const multer = require('multer')
var upload = multer({
  dest: 'static/',
  preservePath: true,
})

const low = require('lowdb')

const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

// const busboy = require('connect-busboy')

// api.use(busboy)

api.get('/getFilePathByAcount', (req, res) => {
  let reportTemplate = db.get('reportTemplate').value()
  
  if (reportTemplate.filePath && fs.existsSync(path.join(__dirname, '../static/' + reportTemplate.filePath))) {
    res.json({
      fileName: reportTemplate.fileName,
      filePath: reportTemplate.filePath,
      msg: "成功",
      respCode: "1000",
      success: true,
    })
  } else {
    res.json({
      fileName: null,
      filePath: null,
      msg: "成功",
      respCode: "1000",
      success: true,
    })
  }
  
})

api.post('/uploadFile', upload.single('file'), (req, res) => {
    if (req.file && req.file.filename) {
      db.update('reportTemplate', value => {
        return {
          filePath: req.file.filename,
          fileName: req.file.originalname
        }
      }).write()
      res.json({
        filePath: req.file.filename,
        msg: "成功",
        respCode: "1000",
        success: true,
      })
    } else {
      res.json({
        msg: '失败',
        respCode: '9999',
        success: true
      })
    }
})

api.get('/deleteFileByAcount', (req, res) => {
  db.update('reportTemplate', value => {
    return {
      filePath: '',
      fileName: ''
    }
  }).write()

  res.json({
    msg: "成功",
    respCode: "1000",
    success: true,
  })
})

api.get('/exportReportRosterTemplate', (req, res) => {
  let reportTemplate = db.get('reportTemplate').value()
  let p = path.resolve(__dirname, "../static/" + reportTemplate.filePath)
  res.download(p, reportTemplate.fileName)
})

api.get('/generateReportByPrincipal', (req, res) => {
  let reportTemplate = db.get('reportTemplate').value()

  res.json({
    filePath: reportTemplate.filePath,
    list: [

    ],
    msg: "成功",
    respCode: "1000",
    success: true,
  })
})

api.get('/generateReportByDepartment', (req, res) => {
  let reportTemplate = db.get('reportTemplate').value()

  res.json({
    filePath: reportTemplate.filePath,
    list: [
      
    ],
    msg: "成功",
    respCode: "1000",
    success: true,
  })
})

api.get('/exportFormInfo', (req, res) => {
  let reportTemplate = db.get('reportTemplate').value()
  let p = path.resolve(__dirname, "../static/" + reportTemplate.filePath)
  res.download(p, reportTemplate.fileName)
})

api.get('/exportUnMatchFormInfo', (req, res) => {
  let reportTemplate = db.get('reportTemplate').value()
  let p = path.resolve(__dirname, "../static/" + reportTemplate.filePath)
  res.download(p, reportTemplate.fileName)
})

api.get('/outputfile/:where', (req, res) => {
  let where =  req.params.where
  let p = path.resolve(__dirname, '../static/' + where) 
  res.download(p, where + '.xlsx')
})

module.exports = api