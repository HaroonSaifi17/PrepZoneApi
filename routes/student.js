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
    res.sendFile(filePath)
  } catch (error) {
    res.status(401).send(error.message).end()
  }
})

router.get('/profileImg', authenticateJWT, async (req, res) => {
  try {
    const data = await getStudentDataById(req.user.userId, 'profileImg name')
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
    const data = await getStudentDataById(req.user.userId, 'phoneNumber name')
    if (typeof data.phoneNumber === 'undefined') {
      res.send({ isNew: false, name: data.name }).end()
    } else {
      res.send({ isNew: true, name: data.name }).end()
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
      chemistryTime: data.chemistryTime[0],
      physicsTime: data.physicsTime[0],
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
      chemistryTime: data.chemistryTime[1],
      physicsTime: data.physicsTime[1],
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
      .select('subject exam totalQuestions questionIds num name answers')
      .exec()
    let correct = [0]
    let wrong = [0]
    let index = 0
    if (test.subject.length == 3) {
      correct.push(0)
      correct.push(0)
      wrong.push(0)
      wrong.push(0)
    }
    for (i = 0; i < test.totalQuestions; i++) {
      if (test.subject.length == 3) {
        if (i < test.totalQuestions / 3) {
          index = 0
        } else if (i < test.totalQuestions / 1.5) {
          index = 1
        } else {
          index = 2
        }
      }
      if (choosenOption[i] == test.answers[i]) {
        correct[index]++
      } else if (choosenOption[i] == 999) {
      } else {
        wrong[index]++
      }
    }
    let marks
    if (test.subject.length == 3) {
      marks =
        (correct[0] + correct[1] + correct[2]) * 4 -
        (wrong[0] + wrong[1] + wrong[2])
      if (test.exam == 'jee') {
        if (correct[0] + wrong[0] !== 0) {
          if(student.mathAccuracy==0){
          student.mathAccuracy = (correct[0] / (correct[0] + wrong[0])) * 100
          }
          else(
          student.mathAccuracy = (student.mathAccuracy + (correct[0] / (correct[0] + wrong[0])) * 100)/2
          )
          if(student.physicsAccuracy[0]==0){
          student.physicsAccuracy[0] = (correct[1] / (correct[1] + wrong[1])) * 100
          }
          else(
          student.physicsAccuracy[0] = (student.physicsAccuracy[0] + (correct[1] / (correct[1] + wrong[1])) * 100)/2
          )
          if(student.chemistryAccuracy[0]==0){
          student.chemistryAccuracy[0] = (correct[2] / (correct[2] + wrong[2])) * 100
          }
          else(
          student.chemistryAccuracy[0] = (student.chemistryAccuracy[0]+ (correct[2] / (correct[2] + wrong[2])) * 100)/2
          )
        }
        student.mathTime += time / test.totalQuestions
        student.physicsTime[0] += time / test.totalQuestions
        student.chemistryTime[0] += time / test.totalQuestions
        if (marks > student.topMarks[0]) {
          student.topMarks[0] = marks
        }
        student.averageMarks[0] += marks
      } else {
        marks =
          ((correct[0] + correct[1] + correct[2]) * 4) -
          (wrong[0] + wrong[1] + wrong[2])
        if (correct[0] + wrong[0] !== 0) {
          if(student.mathAccuracy==0){
          student.bioAccuracy = (correct[0] / (correct[0] + wrong[0])) * 100
          }
          else(
          student.bioAccuracy = (student.mathAccuracy + (correct[0] / (correct[0] + wrong[0])) * 100)/2
          )
          if(student.physicsAccuracy[1]==0){
          student.physicsAccuracy[1] = (correct[1] / (correct[1] + wrong[1])) * 100
          }
          else(
          student.physicsAccuracy[1] = (student.physicsAccuracy[1] + (correct[1] / (correct[1] + wrong[1])) * 100)/2
          )
          if(student.chemistryAccuracy[1]==0){
          student.chemistryAccuracy[1] = (correct[2] / (correct[2] + wrong[2])) * 100
          }
          else(
          student.chemistryAccuracy[1] = (student.chemistryAccuracy[1]+ (correct[2] / (correct[2] + wrong[2])) * 100)/2
          )
        }
        student.bioTime += time / test.totalQuestions
        student.physicsTime[1] += time / test.totalQuestions
        student.chemistryTime[1] += time / test.totalQuestions
        if (marks > student.topMarks[1]) {
          student.topMarks[1] = marks
        }
        student.averageMarks[1] += marks
      }
    } else {
      let index2
      test.exam == 'jee' ? (index2 = 0) : (index2 = 1)
      marks = (correct[0] * 4)- wrong[0]
      if (test.subject[0] === 'math') {
        if (correct[0] + wrong[0] !== 0) {
          if(student.mathAccuracy==0){
          student.mathAccuracy =  (correct[0] / (correct[0] + wrong[0])) * 100
          }
          else{
          student.mathAccuracy = (student.mathAccuracy + (correct[0] / (correct[0] + wrong[0])) * 100)/2
          }
        }
        student.mathTime[0] += time/test.totalQuestions
      } else if (test.subject[0] === 'physics') {
        if (correct[0] + wrong[0] !== 0) {
          if(student.physicsAccuracy[index2]==0){
          student.physicsAccuracy[index2] =  (correct[0] / (correct[0] + wrong[0])) * 100
          }
          else{
          student.physicsAccuracy[index2] =
            (student.physicsAccuracy[index2] + (correct[0] / (correct[0] + wrong[0])) * 100)/2
          }
        }
        student.physicsTime[index2] += time/test.totalQuestions
      } else if (test.subject[0] === 'chemistry') {
        if (correct[0] + wrong[0] !== 0) {
          if(student.chemistryAccuracy[index2]==0){
          student.chemistryAccuracy[index2] =  (correct[0] / (correct[0] + wrong[0])) * 100
          }
          else{
          student.chemistryAccuracy[index2] =
            (student.chemistryAccuracy[index2] +(correct[0] / (correct[0] + wrong[0])) * 100)/2
          }
        }
        student.chemistryTime[index2] += time/test.totalQuestions
      } else if (test.subject[0] === 'bio') {
        if (correct[0] + wrong[0] !== 0) {
          if(student.bioAccuracy==0){
          student.bioAccuracy =  (correct[0] / (correct[0] + wrong[0])) * 100
          }
          else{
          student.bioAccuracy = (student.bioAccuracy + (correct[0] / (correct[0] + wrong[0])) * 100)/2
          }
        }
        student.bioTime += time/test.totalQuestions
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
    res
      .send({ _id: student.results[student.results.length - 1]._id.toString() })
      .status(200)
      .end()
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
      .sort((a, b) => {return (new Date(b.date) - new Date(a.date))*sort})
      .slice(page * limit, (page + 1) * limit)
      .map(({ _id, name, date, marks }) => ({ _id, name, date, marks }))

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

router.get('/getResult/:id', authenticateJWT, async (req, res) => {
  try {
    const student = await Student.findById(req.user.userId)
      .select('results')
      .lean()
      .exec()
    const results = student.results.filter((result) =>
      result._id.equals(req.params.id)
    )
    const test = await Test.findById(results[0].testId)
      .select('exam totalQuestions questionIds answers num')
      .lean()
      .exec()
    data = { test: test, results: results[0] }
    res.send(data).status(200).end()
  } catch (error) {
    res.status(401).send(error.message).end()
  }
})

module.exports = router
