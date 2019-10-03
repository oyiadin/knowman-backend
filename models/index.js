const user = require('./user')
const doc = require('./doc')
const cat = require('./cat')

let models = {}
Object.assign(models, user)
Object.assign(models, doc)
Object.assign(models, cat)

module.exports = models
