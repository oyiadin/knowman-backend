// const models = require('../models')

const express = require('express')
var router = express.Router()

// Data backup
router.get('/', (req, res) => {
  ;
})

// Data restore
router.put('/', (req, res) => {
  ;
})

module.exports.registerTo = (app) => {
  app.use('/data', router)
}
