const mongoose = require('mongoose');

User = mongoose.model('Users', {
  username: String,
  hashedPassword: String,
});


module.exports = {
  User: User
};