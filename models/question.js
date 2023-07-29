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
  img:{
    type:String,
    default:''
  },
  correctOption: {
    type: Number,
    required: true
  }
});
const numericalSchema=new mongoose.Schema({
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  img:{
    type:String,
    default:''
  },
  questionText: {
    type: String,
    required: true
  },
  correctOption: {
    type: Number,
    required: true
  }
})

const JMathQuestion = mongoose.model('JMathQuestion', questionSchema);
const JPhysicsQuestion = mongoose.model('JPhysicsQuestion', questionSchema);
const JChemistryQuestion = mongoose.model('JChemistryQuestion', questionSchema);
const NBiologyQuestion = mongoose.model('NBiologyQuestion', questionSchema);
const NPhysicsQuestion = mongoose.model('NPhysicsQuestion', questionSchema);
const NChemistryQuestion = mongoose.model('NChemistryQuestion', questionSchema);
const MathNumQuestion = mongoose.model('MathNumQuestion', numericalSchema);
const PhysicsNumQuestion = mongoose.model('PhysicsNumQuestion', numericalSchema);
const ChemistryNumQuestion = mongoose.model('ChemistryNumQuestion', numericalSchema);

module.exports = {
  JMathQuestion,
  JPhysicsQuestion,
  JChemistryQuestion,
  NBiologyQuestion,
  NPhysicsQuestion,
  NChemistryQuestion,
  MathNumQuestion,
  PhysicsNumQuestion,
  ChemistryNumQuestion
};
