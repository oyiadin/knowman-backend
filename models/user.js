const mongoose = require('mongoose')

let User = mongoose.model('Users', {
  username: String,
  hashedPassword: String
})

module.exports = {
  User: User
}
