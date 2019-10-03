const express = require('express')
var apiRouter = express.Router()

const cred = require('./cred')
const post = require('./doc')
const user = require('./cat')
const data = require('./data')
const ws = require('./ws')

module.exports.registerTo = (app, httpServer, wsServer) => {
  cred.registerTo(apiRouter)
  user.registerTo(apiRouter)
  post.registerTo(apiRouter)
  data.registerTo(apiRouter)
  ws.registerTo(httpServer, wsServer)

  app.use('/api', apiRouter)
}
