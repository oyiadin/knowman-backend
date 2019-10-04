let config = require('./config.json')
let client = require('redis').createClient(config.redis)
let errcode = require('./errcode.json')

function error (res, category, reason) {
  console.log(category, reason)
  res.json({
    success: 'no',
    error: {
      category,
      reason,
      description: errcode[category]
    }
  })
}
module.exports.error = error

function success (res, ...optionalObject) {
  let responseObj = { success: 'yes' }
  if (optionalObject.length === 1) {
    Object.assign(responseObj, optionalObject)
  }
  res.json(responseObj)
}
module.exports.success = success

module.exports.checkToken = function (req, res, callback) {
  if (req.cookies.token) {
    client.get(req.cookies.token, (err, reply) => {
      if (err) {
        error(res, 'unknownError', err)
      } else if (!reply) {
        error(res, 'dataInvalid', 'Invalid token.')
      } else {
        callback(reply)
      }
    })
  } else {
    error(res, 'dataInvalid', 'Token required.')
  }
}

module.exports.rdnString = function (length) {
  var result = ''
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  var charsLength = chars.length
  for (var i = 0; i < length; ++i) {
    result += chars.charAt(Math.floor(Math.random() * charsLength))
  }
  return result
}
