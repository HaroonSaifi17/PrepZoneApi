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
    type: [String],
    required: true,
  },
  questionIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  ],
})

const Test = mongoose.model('tests', subtestSchema)

module.exports = Test
