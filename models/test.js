const mongoose = require('mongoose')

const subtestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: [String],
    required: true,
  },
  exam: {
    type: String,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  date:String,
  num:Number,
  answers:[Number],
  questionIds: [
    {
      type: String,
      required: true,
    },
  ],
})

const Test = mongoose.model('tests', subtestSchema)

module.exports = Test
