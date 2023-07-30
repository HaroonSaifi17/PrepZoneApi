const router = require('express').Router()
const Student = require('../models/student')
const Test = require('../models/test')
const path = require('path')
const {
  JPhysicsQuestion,
  JChemistryQuestion,
  JMathQuestion,
  NBiologyQuestion,
  NPhysicsQuestion,
  NChemistryQuestion,
  MathNumQuestion,
  ChemistryNumQuestion,
  PhysicsNumQuestion,
} = require('../models/question')
const passport = require('passport')

const authenticateJWT = passport.authenticate('jwt', { session: false })

async function getStudentDataById(userId, fields) {
  try {
    const data = await Student.findById(userId).select(fields).exec()
    if (data) {
      return data
    } else {
      throw new Error('Data not found')
    }
  } catch (error) {
    throw new Error(error.message)
  }
}
router.get('/getImg/:url', async (req, res) => {
  try {
    const fileUrl = req.params.url
    const filePath = path.join(__dirname, '../files/questionImages/', fileUrl)
    console.log(filePath)
    res.sendFile(filePath)
  } catch (error) {
    res.status(401).send(error.message).end()
  }
})

router.get('/profileImg', authenticateJWT, async (req, res) => {
  try {
    const data = await getStudentDataById(req.user.userId, 'profileImg')
    res.send(data).end()
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

router.get('/profileData', authenticateJWT, async (req, res) => {
  try {
    const data = await getStudentDataById(
      req.user.userId,
      'profileImg name email phoneNumber prep'
    )
    res.send(data).end()
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

router.post('/newStudentPost', authenticateJWT, async (req, res) => {
  try {
    const data = await getStudentDataById(
      req.user.userId,
      'name phoneNumber prep'
    )
    data.name = req.body.name
    data.phoneNumber = req.body.phoneNumber
    data.prep = req.body.prep
    await data.save()
    res.status(200).end()
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

router.get('/checkNew', authenticateJWT, async (req, res) => {
  try {
    const data = await getStudentDataById(req.user.userId, 'phoneNumber')
    if (typeof data.phoneNumber === 'undefined') {
      res.send({ isNew: false, name: data.name }).end()
    } else {
      res.send({ isNew: true }).end()
    }
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

router.get('/jeeData', authenticateJWT, async (req, res) => {
  try {
    const data = await getStudentDataById(
      req.user.userId,
      'name topMarks averageMarks physicsAccuracy chemistryAccuracy mathAccuracy mathTime chemistryTime physicsTime'
    )
    const data1 = {
      name: data.name,
      topMarks: data.topMarks[0],
      averageMarks: data.averageMarks[0],
      physicsAccuracy: data.physicsAccuracy[0],
      chemistryAccuracy: data.chemistryAccuracy[0],
      mathAccuracy: data.mathAccuracy,
      mathTime: data.mathTime,
      chemistryTime: data.chemistryAccuracy[0],
      physicsTime: data.physicsAccuracy[0],
    }
    res.json(data1)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

router.get('/neetData', authenticateJWT, async (req, res) => {
  try {
    const data = await getStudentDataById(
      req.user.userId,
      'name topMarks averageMarks physicsAccuracy chemistryAccuracy bioAccuracy bioTime chemistryTime physicsTime'
    )
    const data1 = {
      name: data.name,
      topMarks: data.topMarks[1],
      averageMarks: data.averageMarks[1],
      physicsAccuracy: data.physicsAccuracy[1],
      chemistryAccuracy: data.chemistryAccuracy[1],
      bioAccuracy: data.bioAccuracy,
      bioTime: data.bioTime,
      chemistryTime: data.chemistryAccuracy[1],
      physicsTime: data.physicsAccuracy[1],
    }
    res.json(data1)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

router.get('/getTests', authenticateJWT, async (req, res) => {
  try {
    const page = parseInt(req.query.page) - 1 || 0
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ''
    let sort = parseInt(req.query.sort) || -1
    let genre = req.query.subject || 'All'
    let pageno = [1]
    const genreOptions = ['physics', 'chemistry', 'math', 'bio']

    genre === 'All'
      ? (genre = [...genreOptions])
      : (genre = req.query.subject.split(','))

    const tests = await Test.find({ name: { $regex: search, $options: 'i' } })
      .where('subject')
      .in([...genre])
      .sort({ date: sort })
      .skip(page * limit)
      .limit(limit)
      .lean()
      .select('_id name totalQuestions exam date')
      .exec()

    const total = await Test.countDocuments({
      subject: { $in: [...genre] },
      name: { $regex: search, $options: 'i' },
    })

    let totalpage = total / limit
    if (totalpage > 1) {
      for (let i = 1; i < totalpage; i++) {
        pageno.push(i + 1)
      }
    }
    tests.forEach((test) => {
      test._id = test._id.toString()
    })
    const response = {
      error: false,
      total,
      page: page + 1,
      limit,
      tests,
      pageno,
    }
    res.status(200).json(response)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})
router.get('/getTest/:id', authenticateJWT, async (req, res) => {
  try {
    const question = await Test.findById(req.params.id)
    res.send(question).end()
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})
router.get('/getQuestion', authenticateJWT, async (req, res) => {
  try {
    const { subject, exam, id } = req.query
    const Model = msubjectToModelMap[subject][exam]
    if (!Model) {
      throw new Error('Invalid subject or exam type.')
    }
    const question = await Model.findById(id)
      .select('questionText options img')
      .exec()
    res.send(question).end()
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})
router.get('/getnQuestion', authenticateJWT, async (req, res) => {
  try {
    const { subject, id } = req.query
    const Model = nsubjectToModelMap[subject]
    if (!Model) {
      throw new Error('Invalid subject or exam type.')
    }
    const question = await Model.findById(id).select('questionText img').exec()
    res.send(question).end()
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

const nsubjectToModelMap = {
  math: MathNumQuestion,
  physics: PhysicsNumQuestion,
  chemistry: ChemistryNumQuestion,
}
const msubjectToModelMap = {
  math: {
    jee: JMathQuestion,
  },
  bio: {
    neet: NBiologyQuestion,
  },
  physics: {
    jee: JPhysicsQuestion,
    neet: NPhysicsQuestion,
  },
  chemistry: {
    jee: JChemistryQuestion,
    neet: NChemistryQuestion,
  },
}
router.post('/result', authenticateJWT, async (req, res) => {
  try {
    let student = await Student.findById(req.user.userId).exec()
    const { choosenOption, testId, time } = req.body
    const test = await Test.findById(testId)
      .select('subject exam totalQuestions questionIds num name')
      .exec()
    let correct = [0]
    let wrong = [0]
    let index = 0
    let subject = test.subject[index]
    let exam = test.exam
    for (let i = 0; i < test.totalQuestions; i++) {
      if (test.subject.length == 3) {
        let mul = test.totalQuestions - test.num
        let first = mul / 3
        let second = first + test.num / 3 + mul / 3
        let third = second + test.num / 3 + mul / 3
        if (i < test.totalQuestions / 3) {
          if (i < first) {
            const Model = msubjectToModelMap[subject][exam]
            if (!Model) {
              throw new Error('Invalid subject or exam type.')
            }
            const question = await Model.findById(test.questionIds[i])
              .select('correctOption')
              .exec()
            const selectedOption = choosenOption[i]
            const correctOption = question.correctOption
            if (selectedOption === correctOption) {
              correct[index]++
            } else if (selectedOption === 999) {
            } else {
              wrong[index]++
            }
          } else {
            const Model = nsubjectToModelMap[subject]
            if (!Model) {
              throw new Error('Invalid subject or exam type.')
            }
            const question = await Model.findById(test.questionIds[i])
              .select('correctOption')
              .exec()
            const selectedOption = choosenOption[i]
            const correctOption = question.correctOption
            if (selectedOption === correctOption) {
              correct[index]++
            } else if (selectedOption === 999) {
            } else {
              wrong[index]++
            }
          }
        } else if (i < test.totalQuestions / 1.5) {
          index = 1
          subject = test.subject[index]
          if (!correct[index]) {
            correct[index] = 0
            wrong[index] = 0
          }
          if (i < second) {
            const Model = msubjectToModelMap[subject][exam]
            if (!Model) {
              throw new Error('Invalid subject or exam type.')
            }
            const question = await Model.findById(test.questionIds[i])
              .select('correctOption')
              .exec()
            const selectedOption = choosenOption[i]
            const correctOption = question.correctOption
            if (selectedOption === correctOption) {
              correct[index]++
            } else if (selectedOption === 999) {
            } else {
              wrong[index]++
            }
          } else {
            const Model = nsubjectToModelMap[subject]
            if (!Model) {
              throw new Error('Invalid subject or exam type.')
            }
            const question = await Model.findById(test.questionIds[i])
              .select('correctOption')
              .exec()
            const selectedOption = choosenOption[i]
            const correctOption = question.correctOption
            if (selectedOption === correctOption) {
              correct[index]++
            } else if (selectedOption === 999) {
            } else {
              wrong[index]++
            }
          }
        } else {
          index = 2
          subject = test.subject[index]
          if (!correct[index]) {
            correct[index] = 0
            wrong[index] = 0
          }
          if (i < third) {
            const Model = msubjectToModelMap[subject][exam]
            if (!Model) {
              throw new Error('Invalid subject or exam type.')
            }
            const question = await Model.findById(test.questionIds[i])
              .select('correctOption')
              .exec()
            const selectedOption = choosenOption[i]
            const correctOption = question.correctOption
            if (selectedOption === correctOption) {
              correct[index]++
            } else if (selectedOption === 999) {
            } else {
              wrong[index]++
            }
          } else {
            const Model = nsubjectToModelMap[subject]
            if (!Model) {
              throw new Error('Invalid subject or exam type.')
            }
            const question = await Model.findById(test.questionIds[i])
              .select('correctOption')
              .exec()
            const selectedOption = choosenOption[i]
            const correctOption = question.correctOption
            if (selectedOption === correctOption) {
              correct[index]++
            } else if (selectedOption === 999) {
            } else {
              wrong[index]++
            }
          }
        }
      } else {
        if (i < test.totalQuestions - test.num) {
          const Model = msubjectToModelMap[subject][exam]
          if (!Model) {
            throw new Error('Invalid subject or exam type.')
          }
          const question = await Model.findById(test.questionIds[i])
            .select('correctOption')
            .exec()
          const selectedOption = choosenOption[i]
          const correctOption = question.correctOption
          if (selectedOption === correctOption) {
            correct[index]++
          } else if (selectedOption === 999) {
          } else {
            wrong[index]++
          }
        } else {
          subject = test.subject[index]
          const Model = nsubjectToModelMap[subject]
          if (!Model) {
            throw new Error('Invalid subject or exam type.')
          }
          const question = await Model.findById(test.questionIds[i])
            .select('correctOption')
            .exec()
          const selectedOption = choosenOption[i]
          const correctOption = question.correctOption
          if (selectedOption === correctOption) {
            correct[index]++
          } else if (selectedOption === 999) {
          } else {
            wrong[index]++
          }
        }
      }
    }
    let marks
    if (test.subject.length == 3) {
      marks =
        (correct[0] + correct[1] + correct[2]) * 4 -
        (wrong[0] + wrong[1] + wrong[2])
      if (test.exam == 'jee') {
        if (correct[0] + wrong[0] !== 0) {
          student.mathAccuracy += (correct[0] / (correct[0] + wrong[0])) * 100
        }
        student.mathTime += time / 3
        if (correct[1] + wrong[1] !== 0) {
          student.physicsAccuracy[0] +=
            (correct[1] / (correct[1] + wrong[1])) * 100
        }
        student.physicsTime[0] += time / 3
        if (correct[2] + wrong[2] !== 0) {
          student.chemistryAccuracy[0] +=
            (correct[2] / (correct[2] + wrong[2])) * 100
        }
        student.chemistryTime[0] += time / 3
        if (marks > student.topMarks[0]) {
          student.topMarks[0] = marks
        }
        student.averageMarks[0] += marks
      } else {
        marks =
          (correct[0] + correct[1] + correct[2]) * 4 -
          (wrong[0] + wrong[1] + wrong[2])
        if (correct[0] + wrong[0] !== 0) {
          student.bioAccuracy += (correct[0] / (correct[0] + wrong[0])) * 100
        }
        student.bioTime += time / 3
        if (correct[1] + wrong[1] !== 0) {
          student.physicsAccuracy[1] +=
            (correct[1] / (correct[1] + wrong[1])) * 100
        }
        student.physicsTime[1] += time / 3
        if (correct[2] + wrong[2] !== 0) {
          student.chemistryAccuracy[1] +=
            (correct[2] / (correct[2] + wrong[2])) * 100
        }
        student.chemistryTime[1] += time / 3
        if (marks > student.topMarks[1]) {
          student.topMarks[1] = marks
        }
        student.averageMarks[1] += marks
      }
    } else {
      let index2
      exam == 'jee' ? (index2 = 0) : (index2 = 1)
      marks = correct[0] * 4 - wrong[0]
      if (subject === 'math') {
        if (correct[0] + wrong[0] !== 0) {
          student.mathAccuracy += (correct[0] / (correct[0] + wrong[0])) * 100
        }
        student.mathTime += time
      } else if (subject === 'physics') {
        if (correct[0] + wrong[0] !== 0) {
          student.physicsAccuracy[index2] +=
            (correct[0] / (correct[0] + wrong[0])) * 100
        }
        student.physicsTime[index2] += time
      } else if (subject === 'chemistry') {
        if (correct[0] + wrong[0] !== 0) {
          student.chemistryAccuracy[index2] +=
            (correct[0] / (correct[0] + wrong[0])) * 100
        }
        student.chemistryTime[index2] += time
      } else if (subject === 'bio') {
        if (correct[0] + wrong[0] !== 0) {
          student.bioAccuracy += (correct[0] / (correct[0] + wrong[0])) * 100
        }
        student.bioTime += time
      }
    }

    student.results.push({
      result: choosenOption,
      testId: testId,
      date: new Date().toLocaleString(),
      time: time,
      correct: correct,
      wrong: wrong,
      marks: marks,
      subject: test.subject,
      name: test.name,
    })
    await student.save()
    res.send({id:student._id}).status(200).end()
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

router.get('/getResultList', authenticateJWT, async (req, res) => {
  try {
    const page = parseInt(req.query.page) - 1 || 0
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ''
    let sort = parseInt(req.query.sort) || -1
    let genre = req.query.subject || 'All'
    let pageno = [1]
    const genreOptions = ['physics', 'chemistry', 'math', 'bio']

    genre === 'All'
      ? (genre = [...genreOptions])
      : (genre = req.query.subject.split(','))

    const student = await Student.findById(req.user.userId)
      .select('results')
      .lean()
      .exec()
    const results = student.results
      .filter(
        (result) =>
          result.name.match(new RegExp(search, 'i')) &&
          result.subject.some((subject) => genre.includes(subject))
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(page * limit, (page + 1) * limit)
    .map(({ _id, name, date,marks }) => ({ _id, name, date ,marks}));

    const total = results.length
    let totalpage = total / limit
    if (totalpage > 1) {
      for (let i = 1; i < totalpage; i++) {
        pageno.push(i + 1)
      }
    }
    const response = {
      error: false,
      total,
      page: page + 1,
      limit,
      results,
      pageno,
    }
    res.status(200).json(response)
  } catch (error) {
    res.status(401).send(error.message).end()
  }
})
module.exports = router
