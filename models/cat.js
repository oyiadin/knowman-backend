const mongoose = require('mongoose')

let Cat = mongoose.model('Cat', {
  title: String,
  url: String,
  parent: mongoose.ObjectId
})

module.exports = {
  Cat: Cat
}
