const models = require('../models');

const express = require('express');
var router = express.Router();

const config = require('../config.json');
var client = require('redis').createClient(config.redis);

// Get the list of categories
router.get('/list', (req, res) => {
  ;
});


// Fetch the info of a specific category
router.get('/:id/info', (req, res) => {
  ;
});


// Update the info of a specific category
router.post('/:id/info', (req, res) => {
  ;
});


// Create a new category
router.put('/', (req, res) => {
  ;
});


module.exports.registerTo = (app) => {
  app.use('/cat', router);
};
