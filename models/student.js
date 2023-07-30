const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: String,
  profileImg: String,
  prep: String,
  results: [{
    testId:String,
    date:String,
    correct:[Number],
    wrong:[Number],
    result:[Number],
    time:Number,
    marks:Number,
    subject:[String],
    name:String
  }],
  default:{},
  topMarks: {
    type: [Number],
    default: [0,0],
  },
  averageMarks: {
    type: [Number],
    default: [0,0],
  },
  physicsAccuracy: {
    type: [Number],
    default: [0,0],
  },
  chemistryAccuracy: {
    type: [Number],
    default: [0,0],
  },
  bioAccuracy:{
    type: Number,
    default: 0,
  },
  bioTime:{
    type: Number,
    default: 0,
  },
  mathAccuracy:{
    type: Number,
    default: 0,
  },
  mathTime:{
    type: Number,
    default: 0,
  },
  chemistryTime: {
    type: [Number],
    default: [0,0],
  },
  physicsTime: {
    type: [Number],
    default: [0,0],
  },
})
const Student = mongoose.model('students', studentSchema)
module.exports = Student
