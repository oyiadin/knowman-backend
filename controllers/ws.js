const config = require('../config.json');
var client = require('redis').createClient(config.redis);

var cookie = require('cookie');
var models = require('../models');

let perDocumentClients = {};

function registerDocumentClient(ws) {
  let doc = ws.doc;
  if (perDocumentClients[doc] === undefined) {
    perDocumentClients[doc] = [ws]
  } else {
    perDocumentClients[doc] = perDocumentClients[doc].concat(ws)
  }
  ws.registered = true
  ws.json({ inform: 'registered' })
}

function removeDocumentClient(ws) {
  perDocumentClients[ws.doc].splice(perDocumentClients[ws.doc].indexOf(ws), 1)
}

function dispatch(ws, payload, userId) {
  if (!ws.registered) {
    ws.json({ err: 'unregistered' })
  } else {
    let e = JSON.parse(payload);

    console.log(payload);
    console.log(`==> from doc=${ws.doc}, user=${userId}`);

    if (e.action === 'update' && e.content) {
      let updatedDoc = {
        content: e.content
      }
      models.Doc.updateOne({ url: ws.doc }, updatedDoc, (err, result) => {
        if (err) {
          ws.json({ err })
        } else {
          perDocumentClients[ws.doc].forEach((client) => {
            if (client !== ws) {
              client.json(e)
            }
          })
        }
      })
    }
  }
}

module.exports.registerTo = (httpServer, wsServer) => {
  httpServer.on('upgrade', (req, socket, head) => {
    var cookies = req.headers.cookie;
    var token = cookie.parse(cookies).token;
    const path = require('url').parse(req.url).pathname;
    if (token) {
      client.get('token:'+token, (err, userId) => {
        if (err || !userId) {
          console.log(`no such userId: ${userId}`);
          socket.destroy();
        } else {
          if (path.slice(0, 8) !== '/ws/doc/') {
            console.log(`unsupported path: ${path}`);
            socket.destroy();
          } else {
            let doc = path.slice(8);
            models.Doc.findOne({ url: doc }, (err, reply) => {
              if (err || !reply) {
                console.log(`no such doc: ${doc}`)
                socket.destroy();
              } else {
                wsServer.handleUpgrade(req, socket, head, (ws) => {
                  function errorHandler(err) {
                    console.log(`websocket error: ${err}`);
                    removeDocumentClient(ws)
                  }
                  ws.json = (obj) => { ws.send(JSON.stringify(obj)) }
                  ws.doc = doc

                  ws.on('message', (msg) => { dispatch(ws, msg, userId) });
                  ws.on('error', errorHandler);
                  ws.on('close', (code, reason) => { errorHandler(code+reason) });

                  registerDocumentClient(ws);
                })
              }
            })
          }
        }
      });
    } else {
      console.log('token required');
      socket.destroy();
    }
  })
};
