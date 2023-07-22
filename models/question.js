const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correctOption: {
    type: Number,
    required: true
  }
});

const JMathQuestion = mongoose.model('JMathQuestion', questionSchema);
const JPhysicsQuestion = mongoose.model('JPhysicsQuestion', questionSchema);
const JChemistryQuestion = mongoose.model('JChemistryQuestion', questionSchema);
const NBiologyQuestion = mongoose.model('NBiologyQuestion', questionSchema);
const NPhysicsQuestion = mongoose.model('NPhysicsQuestion', questionSchema);
const NChemistryQuestion = mongoose.model('NChemistryQuestion', questionSchema);

module.exports = {
  JMathQuestion,
  JPhysicsQuestion,
  JChemistryQuestion,
  NBiologyQuestion,
  NPhysicsQuestion,
  NChemistryQuestion
};
