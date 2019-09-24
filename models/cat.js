const mongoose = require('mongoose');
const User = require('./user').User;

Cat = mongoose.model('Cat', {
  title: String,
  children: [mongoose.ObjectId],
});


module.exports = {
  Cat: Cat,
};
