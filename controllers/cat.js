const models = require('../models')

const express = require('express')
var router = express.Router()

// Get the sub-categories of a specific category
router.get('/:url/subcats', (req, res) => {
  models.Cat.findOne({ url: req.params.url }, (err, cat) => {
    if (err) {
      res.json({ err: err })
    } else if (!cat) {
      res.json({ err: 'No such category' })
    } else {
      models.Cat.find({ parent: cat._id }, (err, subcats) => {
        if (err) {
          res.json({ err: err })
        } else {
          res.json({ subcats: subcats })
        }
      })
    }
  })
})

// Fetch the list of documents belonging to a specific category
router.get('/:url/docs', (req, res) => {
  models.Cat.findOne({ url: req.params.url }, (err, cat) => {
    if (err) {
      res.json({ err: err })
    } else if (!cat) {
      res.json({ err: 'No such category' })
    } else {
      models.Doc.find({ category: cat._id }, (err, docs) => {
        if (err) {
          res.json({ err: err })
        } else {
          res.json({ docs: docs })
        }
      })
    }
  })
})

// Update the info of a specific category
router.post('/:url', (req, res) => {
  let updated = {
    title: req.body.title,
    url: req.body.url
  }
  models.Cat.update({ url: req.params.url }, updated, (err, cat) => {
    if (err) {
      res.json({ err: err })
    } else if (!cat) {
      res.json({ err: 'No such category' })
    } else {
      res.json({ msg: 'OK' })
    }
  })
})

// Create a new category
router.put('/:url', (req, res) => {
  models.Cat.findOne({ url: req.params.url }, (err, parentCat) => {
    if (err) {
      res.json({ err: err })
    } else if (!parentCat) {
      res.json({ err: 'No such parent category' })
    } else {
      models.Cat.findOne({ url: req.body.url }, (err, cat) => {
        if (err) {
          res.json({ err: err })
        } else if (cat) {
          res.json({ err: 'The URL has been taken' })
        } else {
          const newCat = {
            title: req.body.title,
            url: req.body.url,
            parent: parentCat._id
          }
          models.Cat.create(newCat, (err, newcat) => {
            if (err) {
              res.json({ err: err })
            } else {
              res.json({ msg: 'OK' })
            }
          })
        }
      })
    }
  })
})

module.exports.registerTo = (app) => {
  app.use('/cat', router)
}
