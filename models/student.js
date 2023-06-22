const mongoose = require("mongoose")

const studentSchema = new mongoose.Schema({
  name: String,
  email: {
    type:String,
    required:true,
    unique:true
  },
  phoneNumber: String,
  profileImg: String,
  math: {
    type: {
      tests: [{
        id: {
          type: Number,
          required: true
        },
        performance: {
          type: Number,
          default: 0
        },
        time: {
          type: Number,
          default: 0
        },
        accuracy: {
          type: Number,
          default: 0
        }
      }]
    },
    default: {}
  },
  biology: {
    type: {
      tests: [{
        id: {
          type: Number,
          required: true
        },
        performance: {
          type: Number,
          default: 0
        },
        time: {
          type: Number,
          default: 0
        },
        accuracy: {
          type: Number,
          default: 0
        }
      }]
    },
    default: {}
  },
  physics: {
    type: {
      tests: [{
        id: {
          type: Number,
          required: true
        },
        performance: {
          type: Number,
          default: 0
        },
        time: {
          type: Number,
          default: 0
        },
        accuracy: {
          type: Number,
          default: 0
        }
      }]
    },
    default: {}
  },
  chemistry: {
    type: {
      tests: [{
        id: {
          type: Number,
          required: true
        },
        performance: {
          type: Number,
          default: 0
        },
        time: {
          type: Number,
          default: 0
        },
        accuracy: {
          type: Number,
          default: 0
        }
      }]
    },
    default: {}
  },
  overallPerformance: {
    type: Number,
    default: 0
  }
})
const Student = mongoose.model('students', studentSchema)
module.exports = Student
