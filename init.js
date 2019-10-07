const mongoose = require('mongoose')
const config = require('./config.json')
mongoose.connect(
  `${config.db}/${config.database}`,
  { useNewUrlParser: true })

var models = require('./models')

models.Cat.findOne({ url: 'root' }, (err, cat) => {
  if (err) {
    console.log(`Error occurred during finding root-category: ${err}`)
  } else if (cat) {
    console.log('Root-category already existed')
  } else {
    models.Cat.create({
      title: 'Root',
      path: 'root',
      parent: null
    })
    console.log('Root-category created')
  }
})
