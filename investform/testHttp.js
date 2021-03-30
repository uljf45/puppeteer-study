const http = require('http')
const pupHelp = require('./util/pupHelp')
const {createWorker } = require('tesseract.js')
const path = require('path')


;(async function () {

  const worker = createWorker({
    logger: m => console.log(m), // Add logger here 显示日志可以获取报错信息
    langPath: path.join(__dirname, '../lib') // 设置语言包位置, 本地下载语言包
  });
  
  (async () => {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(`data:image/jpg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAoAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD0yuA8d6+rXlro0VxLFG0g+1tGpzt44HrwSa7+uFn/ANP+LMKdVsrfJ/75J/m4rxUeNI3vDWnaTaWTXWkRyxw3OMiQtk7cjOG5HetskAZJAHvS1wXxEuLqS90bSop3hgu5sSsjbSQOozTiuZ2NKVPnkone0Vw2s6Fe+GdCubvQNSuE8pNzwTtvU47jjIP6V1GgXzanoNleSEF5YgzEevehx0uhyp2jzJ3Ro1zet+Iry31VNJ0ezS7vjH5jiQ4RF9zmukrz59Sg8PfEbUrnUy6Q3VuvkuFLZIxgDH0IrfDQU29L2W3c0w8FJvS9lsdL4Y19tdtJ/Pg8i8tpPKni9D6j2/wrcrhPAkst14g8R3LxtGrzKShHQktgfXFd3SxMFCq4ry/IWIgoVGkc7f2E1jbyXM2uXwAPyouCWJ6KB61oaJBfQ2OdQmaSZzuwxyUHpmo4baXUdXa7nC/ZrU7bdd4IZu7nn8BWt0pVJvl5WTPmSswooorAyJN4HQn8ABVeOFIrqS4Vpi7jBDXEjKPopbaPwFSUU7s09rLoSeYD95cj61h+JfDlr4jtYkaSS2ngkEkM6AMUI9u4rYopqTQ1Wmnc5jXU1t/D9zAW0+QGMrLPIWi49QvzD/x7irPgm3lg8H6fFI0bsqEbopFdTyehBxWve2kV/ZTWk+TFKpVtpwcGmabp8GladBY22fJhXau45OKfMuWxTqxdPlt1LvlP6D86rzQxM43Nbi4GfKLLvK+/rUtFJNIhSgtl+JQ0TR4NFtJI1fzJ5pDLPMw/1jnqcdvp2rRch42Tc4DDHy8U2inKbk+Z7lSrSk7kNlawWFqltBHiNOm4kk/WpqKKltt3Zm5N7hRRRSJCiiigAooooAKKKKACiiigAooooAKKKKACiiigD//Z`);
    console.log(text);
    await worker.terminate();
  })();

  // let url = await pupHelp.isRuning()
  // console.log(url)
  // new Promise((resolve, reject) => {
  //   http.get(url, (res) => {
  //     console.log(url)
  //     console.log('in http get')
  //     res.on('end', () => {
  //       console.log('in http get end')
  //       resolve(true)
  //     })
  //   }).on('error', (e) => {
  //     resolve(false)
  //   });
  // })
})()