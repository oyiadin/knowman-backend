let config = require('./config.json')
let client = require('redis').createClient(config.redis)
let errcode = require('./errcode.json')

module.export.error = function (res, category, reason) {
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

module.export.success = function (res, ...optionalObject) {
  let responseObj = { success: 'yes' }
  if (optionalObject.length === 1) {
    Object.assign(responseObj, optionalObject)
  }
  res.json(responseObj)
}

module.exports.checkToken = function (req, res, callback) {
  if (req.cookies.token) {
    client.get('token:' + req.cookies.token, (err, reply) => {
      if (err) {
        module.export.error(res, 'unknownError', err)
      } else if (!reply) {
        res.json({ err: 'Invalid token' })
      } else {
        callback(reply)
      }
    })
  } else {
    res.json({ err: 'Token required' })
    res.end()
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
