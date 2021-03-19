module.exports = app => {
  const mongoose = require('mongoose')
  mongoose.connect('mongodb://localhost:27017/node-wx', {
      useNewUrlParser: true,
      useUnifiedTopology: true
  })
  require('require-all')(__dirname+'/../models')
}