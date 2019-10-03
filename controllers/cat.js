let models = require('../models')
let utils = require('../utils')
let router = require('express').Router()

let error = utils.error
let success = utils.success

// Get the sub-categories, sub-documents and other information of a specific category
router.get('/:path/children', (req, res) => {
  models.Cat.findOne({ path: req.params.path }, (err, cat) => {
    if (err) {
      error(res, 'unknownError', err)
    } else if (!cat) {
      error(res, 'dataNotFound', 'No such category')
    } else {
      models.Cat.find({ parent: cat._id }, (err, subcats) => {
        if (err) {
          error(res, 'unknownError', err)
        } else {
          models.Doc.find({ category: cat._id }, (err, subdocs) => {
            if (err) {
              error(res, 'unknownError', err)
            } else {
              let parents = [];
              (function pushParents (cat, depth, callback) {
                if (depth && cat.parent) {
                  models.Cat.findOne({ _id: cat.parent }, (err, parent) => {
                    if (err) {
                      error(res, 'unknownError', err)
                    } else if (!parent) {
                      error(res, 'dataNotFound', 'No such parent-category, something went wrong.')
                      console.error("[ERROR] Something weird happened (it wasn't supposed to happen).")
                    } else {
                      let dataToPush = {
                        title: parent.title,
                        path: parent.path
                      }
                      parents.push(dataToPush)
                      pushParents(parent, depth - 1, callback)
                    }
                  })
                } else {
                  callback()
                }
              })(cat, 3, () => {
                success({ subdocs, subcats, parents })
              })
            }
          })
        }
      })
    }
  })
})

// Update the info of a specific category
router.post('/:path', (req, res) => {
  if (!req.params.path || (!req.body.title && !req.body.path && !req.body.parent)) {
    error(res, 'dataInvalid', 'Please fill in all the required items.')
  } else {
    utils.checkToken(req, res, userId => {
      let filter = { path: req.params.path }
      let dataToBeUpdated = {}
      for (let key in ['title', 'path']) {
        if (req.body[key] !== undefined) {
          dataToBeUpdated[key] = req.body[key]
        }
      }

      function doUpdate () {
        models.Cat.update(filter, dataToBeUpdated, (err, cat) => {
          if (err) {
            error(res, 'unknownError', err)
          } else if (!cat) {
            error(res, 'dataNotFound', 'No such category.')
          } else {
            success()
          }
        })
      }

      function checkPath (successCallback) {
        if (req.body.path) {
          models.Cat.findOne({ path: req.body.path }, (err, cat) => {
            if (err) {
              error(res, 'unknownError', err)
            } else if (cat) {
              error(res, 'dataConflict', 'The requested new path was already been taken.')
            } else {
              successCallback()
            }
          })
        } else {
          successCallback()
        }
      }

      function checkParent (successCallback) {
        if (req.body.parent) {
          models.Cat.findOne({}) // TODO: unfinished
        }
      }

      checkPath(checkParent(doUpdate))
    })
  }
})

// Create a new category
router.put('/:path', (req, res) => {
  models.Cat.findOne({ path: req.params.path }, (err, parentCat) => {
    if (err) {
      error(res, 'unknownError', err)
    } else if (!parentCat) {
      res.json({ err: 'No such parent category' })
    } else {
      models.Cat.findOne({ path: req.body.path }, (err, cat) => {
        if (err) {
          error(res, 'unknownError', err)
        } else if (cat) {
          res.json({ err: 'The path has been taken' })
        } else {
          const newCat = {
            title: req.body.title,
            path: req.body.path,
            parent: parentCat._id
          }
          models.Cat.create(newCat, (err, newcat) => {
            if (err) {
              error(res, 'unknownError', err)
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
