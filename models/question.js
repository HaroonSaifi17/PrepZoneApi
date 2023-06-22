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

const MathQuestion = mongoose.model('MathQuestion', questionSchema);
const BiologyQuestion = mongoose.model('BiologyQuestion', questionSchema);
const PhysicsQuestion = mongoose.model('PhysicsQuestion', questionSchema);
const ChemistryQuestion = mongoose.model('ChemistryQuestion', questionSchema);

module.exports = {
  MathQuestion,
  BiologyQuestion,
  PhysicsQuestion,
  ChemistryQuestion
};
