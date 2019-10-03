const mongoose = require('mongoose')
const User = require('./user').User
const Cat = require('./cat').Cat

const _Permissions = {
  pPrivate: 0,
  pPublic: 1
}

let Doc = mongoose.model('Docs', {
  title: String,
  url: String,
  ownedBy: { type: mongoose.ObjectId, ref: User },
  createdAt: Date,
  updatedAt: Date,
  permission: { type: Number, min: 0, max: 1 },
  category: { type: mongoose.ObjectId, ref: Cat },
  content: String
})

module.exports = {
  Doc: Doc,
  _Permissions: _Permissions
}
