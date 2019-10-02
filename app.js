const config = require('./config.json');

const mongoose = require('mongoose');
mongoose.connect(
  `${config.db}/${config.database}`,
  { useNewUrlParser: true });

var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
var server = require('http').createServer(app);
var WebSocket = require('ws');
var wsServer = new WebSocket.Server({ noServer: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const controllers = require('./controllers');
controllers.registerTo(app, server, wsServer);

server.listen(config.port, '0.0.0.0', () => {
  console.log(`Server listening http://localhost:${config.port}`)
});
