let models = require('../models')
let utils = require('../utils')
let router = require('express').Router()

let error = utils.error
let success = utils.success

// Create a document
router.put('/', (req, res) => {
  if (!req.body.title || !req.body.permission || !req.body.category) {
    error(res, 'dataInvalid', 'Please fill in all the required items.')
  } else if (req.body.permission > 0o77 || req.body.permission < 0o00) {
    error(res, 'dataInvalid', 'Invalid permission value.')
  } else {
    utils.checkToken(req, res, userId => {
      let catPath = req.body.category
      models.Cat.findOne({ path: catPath }, (err, cat) => {
        if (err) {
          error(res, 'unknownError', err)
        } else if (!cat) {
          error(res, 'dataNotFound', 'No such category.')
        } else {
          (function checkIfValid () {
            let path = utils.rdnString(6)
            models.Doc.findOne({ path }, (err, reply) => {
              if (err) {
                error(res, 'unknownError', err)
              } else if (reply) {
                checkIfValid()
              } else {
                let dataToBeCreated = {
                  title: req.body.title,
                  path,
                  ownedBy: userId,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                  permission: req.body.permission,
                  category: cat._id,
                  content: ''
                }
                models.Doc.create(dataToBeCreated, (err, newDoc) => {
                  if (err) {
                    error(res, 'unknownError', err)
                  } else {
                    let responseData = {
                      title: req.body.title,
                      path
                    }
                    success({ newDoc: responseData })
                  }
                })
              }
            })
          })()
        }
      })
    })
  }
})

// Get the detailed information of a document
router.get('/:path', (req, res) => {
  utils.checkToken(req, res, userId => {
    models.Doc.findOne({ path: req.params.path }, (err, doc) => {
      if (err) {
        error(res, 'unknownError', err)
      } else if (!doc) {
        error(res, 'dataNotFound', 'No such document.')
      } else {
        models.User.findOne({ _id: doc.ownedBy }, (err, user) => {
          if (err) {
            error(res, 'unknownError', err)
          } else if (!user) {
            error(res, 'dataNotFound', 'No such ownedBy user, something went wrong.')
            console.error("[ERROR] Something weird happened (it wasn't supposed to happen).")
          } else {
            models.Cat.findOne({ _id: doc.category }, (err, cat) => {
              if (err) {
                error(res, 'unknownError', err)
              } else if (!cat) {
                error(res, 'dataNotFound', 'No such category, something went wrong.')
                console.error("[ERROR] Something weird happened (it wasn't supposed to happen).")
              } else {
                let responseData = {
                  title: doc.title,
                  path: doc.path,
                  ownedBy: user.username,
                  createdAt: doc.createdAt,
                  updatedAt: doc.updatedAt,
                  permission: doc.permission,
                  category: cat.path
                }
                success(responseData)
              }
            })
          }
        })
      }
    })
  })
})

// Delete a document
router.delete('/:path', (req, res) => {
  utils.checkToken(req, res, userId => {
    models.Doc.findOne({ path: req.params.path }, (err, doc) => {
      if (err) {
        error(res, 'unknownError', err)
      } else if (!doc) {
        error(res, 'dataNotFound', 'No such document.')
      } else {
        if (doc.ownedBy === userId) {
          models.Doc.deleteOne({ path: req.params.path }, (err) => {
            if (err) {
              error(res, 'unknownError', err)
            } else {
              success()
            }
          })
        } else {
          error(res, 'permissionRequired', 'More permission needed to delete this document.')
        }
      }
    })
  })
})

// Fetch the list of history versions
router.get('/:path/history/list', (req, res) => {
  ;
})

// Fetch the info of a specific version
router.get('/:path/history/:ver', (req, res) => {
  ;
})

module.exports.registerTo = (app) => {
  app.use('/doc', router)
}
