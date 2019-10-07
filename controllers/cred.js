let models = require('../models')
let utils = require('../utils')
let router = require('express').Router()
let config = require('../config.json')
let client = require('redis').createClient(config.redis)
let sha256 = require('js-sha256').sha256

let error = utils.error
let success = utils.success

// Register
router.put('/', (req, res) => {
  if (!req.body.username || !req.body.hashedPassword) {
    error(res, 'dataInvalid', 'missingRequired', 'Please fill in your username and password.')
  } else if (req.cookies.token) {
    error(res, 'operationInvalid', 'alreadyLoggedIn', "You've already logged in.")
  } else {
    let username = req.body.username
    models.User.findOne({ username }, (err, user) => {
      if (err) {
        error(res, 'unknownError', err)
      } else if (user) {
        error(res, 'dataConflict', 'userConflict', `The user ${username} has already existed.`)
      } else {
        let hashedPassword = sha256(req.body.hashedPassword + config.passwordSalt)
        const newUser = { username, hashedPassword }
        models.User.create(newUser, (err, _) => {
          if (err) {
            error(res, 'unknownError', err)
          } else {
            success(res)
          }
        })
      }
    })
  }
})

// Login
router.post('/', (req, res) => {
  if (!req.body.username || !req.body.hashedPassword) {
    error(res, 'dataInvalid', 'missingRequired', 'Please fill in your username and password.')
  } else if (req.cookies.token) {
    error(res, 'operationInvalid', 'alreadyLoggedIn', "You've already logged in.")
  } else {
    let username = req.body.username
    let hashedPassword = sha256(req.body.hashedPassword + config.passwordSalt)
    let filter = { username, hashedPassword }
    models.User.findOne(filter, (err, user) => {
      if (err) {
        error(res, 'unknownError', err)
      } else if (!user) {
        error(res, 'dataNotFound', 'invalidCredential', 'Invalid credential, check your username and password please.')
      } else {
        (function checkIfValid () {
          let token = utils.rdnString(64)
          client.get(token, (err, reply) => {
            if (err) {
              error(res, 'unknownError', err)
            } else if (reply === null) {
              client.set(token, user._id.toString(), 'EX', 60 * 60 * 24 * 7 + 60)
              res.cookie('token', token, { maxAge: 1000 * 60 * 60 * 24 * 7 }) // 7 days
              success(res, { token })
            } else {
              checkIfValid()
            }
          })
        })()
      }
    })
  }
})

// Logout
router.delete('/', (req, res) => {
  if (!req.cookies.token) {
    error(res, 'operationInvalid', 'notLoggedIn', "You haven't logged in yet.")
  } else if (req.cookies.token.length !== 64) {
    error(res, 'dataInvalid', 'tokenInvalid', 'Invalid token.')
  } else {
    client.del(req.body.token, (err, _) => {
      if (err) {
        error(res, 'unknownError', err)
      } else {
        res.clearCookie('token')
        success(res)
      }
    })
  }
})

// User information
router.get('/userInfo', (req, res) => {
  utils.checkToken(req, res, userId => {
    models.User.findOne({ _id: userId }, (err, user) => {
      if (err) {
        error(res, 'unknownError', err)
      } else if (!user) {
        res.clearCookie('token')
        error(res, 'dataNotFound', 'userNotFound', 'No such user, something went wrong.')
        console.error("[ERROR] Something weird happened (it wasn't supposed to happen).")
      } else {
        let responseData = {
          username: user.username
        }
        success(res, { user: responseData })
      }
    })
  })
})

module.exports.registerTo = app => {
  app.use('/cred', router)
}
