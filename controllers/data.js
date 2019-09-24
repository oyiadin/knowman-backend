const models = require('../models');

const express = require('express');
var router = express.Router();

const config = require('../config.json');
var client = require('redis').createClient(config.redis);

// Data backup
router.get('/', (req, res) => {
  ;
});


// Data restore
router.put('/', (req, res) => {
  ;
});


module.exports.registerTo = (app) => {
  app.use('/data', router);
};
