const mongoose = require('mongoose')
const User = require('./user').User
const Cat = require('./cat').Cat

// Document permission representation demenstration:
//   We use a two-digit octal to represent the permission of a document
//   The first digit describes which permissions will be granted to logged in users
//   The second digit describes which permissions will be granted to guests
//
//   We use 4 to represent READ, 2 for WRITE, 1 for MANAGE
//   Every digit is the result of summing up all permission we want to grant.

let Doc = mongoose.model('Docs', {
  title: String,
  path: String,
  ownedBy: { type: mongoose.ObjectId, ref: User },
  createdAt: Date,
  updatedAt: Date,
  permission: { type: Number, min: 0o00, max: 0o77 },
  category: { type: mongoose.ObjectId, ref: Cat },
  content: String
})

module.exports = {
  Doc
}
