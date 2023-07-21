const mongoose = require('mongoose')

const pdfSchema = new mongoose.Schema({
  name: String,
  date: String,
  url: String,
  subject:String
})

const Pdf = mongoose.model('Pdf', pdfSchema)

module.exports = Pdf
