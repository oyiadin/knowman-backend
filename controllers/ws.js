let config = require('../config.json')
let errcode = require('../errcode.json')
let url = require('url')
let cookie = require('cookie')
let client = require('redis').createClient(config.redis)
let models = require('../models')

let perDocumentClients = {}

function registerDocumentClient (ws) {
  let path = ws.path
  if (perDocumentClients[path] === undefined) {
    perDocumentClients[path] = [ws]
  } else {
    perDocumentClients[path] = perDocumentClients[path].concat(ws)
  }
  ws.registered = true
  ws.inform('registered')
}

function removeDocumentClient (ws) {
  perDocumentClients[ws.path].splice(perDocumentClients[ws.path].indexOf(ws), 1)
}

function dispatch (ws, payload, userId) {
  if (!ws.registered) {
    ws.error('operationInvalid', 'notRegistered', "This WebSocket client hasn't been registered yet, wait a moment.")
  } else {
    let e = JSON.parse(payload)
    console.log(payload, `==> path=${ws.path}, user=${userId}`)

    if (e.action === 'update') {
      if (!e.content) {
        ws.error('dataInvalid', 'missingRequired', 'Item `content` is required.')
      } else if (!ws.pWrite) {
        ws.error('permissionRequired', 'permissionRequired', 'More permission needed to write to the document.')
      } else {
        let updatedDoc = {
          content: e.content
        }
        models.Doc.updateOne({ path: ws.path }, updatedDoc, (err) => {
          if (err) {
            ws.error('unknownError', err)
          } else {
            perDocumentClients[ws.path].forEach(client => {
              if (client !== ws) {
                client.inform('update', {
                  content: e.content
                })
              }
            })
          }
        })
      }
    } else if (e.action === 'read') {
      if (!ws.pRead) {
        ws.error('permissionRequired', 'permissionRequired', 'More permission needed to read the document.')
      } else {
        models.Doc.findOne({ path: ws.path }, (err, doc) => {
          if (err) {
            ws.error('unknownError', err)
          } else {
            ws.success({
              content: doc.content
            })
          }
        })
      }
    }
  }
}

module.exports.registerTo = (httpServer, wsServer) => {
  httpServer.on('upgrade', (req, socket, head) => {
    let token = cookie.parse(req.headers.cookie).token
    let URL = new url.URL(req.path)
    let pathname = URL.pathname
    if (token) {
      client.get(token, (err, userId) => {
        if (err || !userId) {
          console.log(`err occurred ${err} or no such userId ${userId}`)
          socket.destroy()
        } else {
          if (pathname.slice(0, 8) !== '/ws/doc/') {
            console.log(`unsupported path: ${pathname}`)
            socket.destroy()
          } else {
            let path = pathname.slice(8)
            models.Doc.findOne({ path }, (err, doc) => {
              if (err || !doc) {
                console.log(`no such doc: ${path}`)
                socket.destroy()
              } else if (userId !== doc.ownedBy.toString() && !(doc.permission & 0o60)) {
                socket.destroy()
              } else {
                wsServer.handleUpgrade(req, socket, head, ws => {
                  if (doc.permission & 0o40) { ws.pRead = true } else { ws.pRead = false }
                  if (doc.permission & 0o20) { ws.pWrite = true } else { ws.pWrite = false }

                  function errorHandler (err) {
                    console.log(`websocket error: ${err}`)
                    removeDocumentClient(ws)
                  }
                  ws.json = obj => { ws.send(JSON.stringify(obj)) }
                  ws.error = function (category, reasonShort, reason) {
                    if (reason === undefined) {
                      reason = reasonShort
                      reasonShort = category
                    }
                    ws.json({
                      success: 'no',
                      error: {
                        category,
                        reasonShort,
                        reason,
                        description: errcode[category]
                      }
                    })
                  }
                  ws.success = function (...optionalObject) {
                    let responseObj = { success: 'yes' }
                    if (optionalObject.length === 1) {
                      Object.assign(responseObj, optionalObject)
                    }
                    ws.json(responseObj)
                  }
                  ws.inform = function (what, ...optionalObject) {
                    let responseObj = {
                      success: 'yes',
                      inform: what
                    }
                    if (optionalObject.length === 1) {
                      Object.assign(responseObj, optionalObject)
                    }
                    ws.json(responseObj)
                  }

                  ws.path = path

                  ws.on('message', msg => {
                    dispatch(ws, msg, userId)
                  })
                  ws.on('error', errorHandler)
                  ws.on('close', (code, reason) => {
                    errorHandler(code + reason)
                  })

                  registerDocumentClient(ws)
                })
              }
            })
          }
        }
      })
    } else {
      console.log('token required')
      socket.destroy()
    }
  })
}
