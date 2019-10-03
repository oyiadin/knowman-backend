const express = require('express')
var apiRouter = express.Router()

const auth = require('./auth')
const post = require('./doc')
const user = require('./cat')
const data = require('./data')
const ws = require('./ws')

module.exports.registerTo = (app, httpServer, wsServer) => {
  auth.registerTo(apiRouter)
  user.registerTo(apiRouter)
  post.registerTo(apiRouter)
  data.registerTo(apiRouter)
  ws.registerTo(httpServer, wsServer)

  app.use('/api', apiRouter)
}
