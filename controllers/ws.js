const config = require('../config.json');
var client = require('redis').createClient(config.redis);

var cookie = require('cookie');

module.exports.registerTo = (httpServer, wsServer) => {
  wsServer.on('authenticated', (ws, req, userId) => {
    ws.on('message', (msg) => {
      console.log(`received "${msg}" from ${userId}.`);
    });
  });

  httpServer.on('upgrade', (req, socket, head) => {
    var cookies = req.headers.cookie;
    var token = cookie.parse(cookies).token;
    if (token) {
      client.get('token:'+token, (err, reply) => {
        if (err || !reply) {
          socket.destroy();
        } else {
          wsServer.handleUpgrade(req, socket, head, (ws) => {
            wsServer.emit('authenticated', ws, req, reply);
          })
        }
      });
    } else {
      socket.destroy();
    }
  })
};
