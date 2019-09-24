const express = require('express');
var apiRouter = express.Router();

const auth = require('./auth');
const post = require('./doc');
const user = require('./cat');
const data = require('./data');


module.exports.registerTo = (app) => {
  auth.registerTo(apiRouter);
  user.registerTo(apiRouter);
  post.registerTo(apiRouter);
  data.registerTo(apiRouter);

  app.use('/api', apiRouter);
};
