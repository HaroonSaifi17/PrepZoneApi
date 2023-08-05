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

const Test = require('../models/test')
const router = require('express').Router()

async function getRandomQuestions(Model, difficulty, num) {
  return await Model.aggregate([
    { $match: { difficulty: { $eq: difficulty } } },
    { $sample: { size: num } }
  ]).exec();
}

const msubjectToModelMap = {
  math:{jee: JMathQuestion},
  bio: {neet:NBiologyQuestion},
  physics: {
    jee: JPhysicsQuestion,
    neet: NPhysicsQuestion,
  },
  chemistry: {
    jee: JChemistryQuestion,
    neet: NChemistryQuestion,
  },
}
const nsubjectToModelMap = {
  math: MathNumQuestion,
  physics: PhysicsNumQuestion,
  chemistry: ChemistryNumQuestion,
}
const multer = require('multer')
const fs = require('fs');
const passport = require('passport');
let imgName

const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './files/questionImages')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length
    )
    imgName = file.fieldname + '-' + uniqueSuffix + ext
    cb(null, imgName)
  },
})

const upload1 = multer({ storage: storage1 })

router.get('/check',passport.authenticate('adminJwt', { session: false }), async (req, res) => {
  try {
    res.send({check:true}).status(200).end()
  } catch (error) {
    res.status(401).send(error.message).end()
  }
  })

router.post('/addMQuestion',passport.authenticate('adminJwt',{session:false}),upload1.single('img'), async (req, res) => {
  try {
    const { subject, exam, difficulty, questionText, options, correctOption } =
      req.body
    const Model = msubjectToModelMap[subject][exam]
    if (!Model) {
      throw new Error('Invalid subject or exam type.')
    }
    const question = new Model({
      difficulty,
      questionText,
      options,
      correctOption,
      img:imgName
    })
    await question.save()
    res.status(200).end()
  } catch (error) {
    res.status(401).send(error.message).end()
  }
})

router.post('/addNQuestion',passport.authenticate('adminJwt', { session: false }), async (req, res) => {
  try {
    const { subject, difficulty, questionText, correctOption } = req.body

    const Model = nsubjectToModelMap[subject]
    if (!Model) {
      throw new Error('Invalid subject')
    }

    const question = new Model({
      difficulty,
      questionText,
      correctOption,
      img:imgName
    })

    res.status(200).end()
  } catch (error) {
    res.status(401).send(error.message).end()
  }
})


router.get('/GeneratePaper', async (req, res) => {
  try {
    const { subject, exam, difficulty, totalQuestions, num } = req.body

    let mult = totalQuestions - num
    let questionIds = []
    let subjects1=[]
    let answers=[]

    if (subject === 'all') {
      if (exam === 'jee') {
        const subjects = ['math', 'physics', 'chemistry']
        subjects1=subjects
        for (let i = 0; i < 3; i++) {
          const mmodel = msubjectToModelMap[subjects[i]][exam]
          const nmodel = nsubjectToModelMap[subjects[i]]
          if (!mmodel && !nmodel) {
            throw new Error('Invalid subject or exam type.')
          }

          const mquestions = await getRandomQuestions(
            mmodel,
            difficulty,
            mult / 3
          )
          const nquestions = await getRandomQuestions(
            nmodel,
            difficulty,
            num / 3
          )
          questionIds = questionIds.concat(
            mquestions.map((item) => item._id),
            nquestions.map((item) => item._id)
          )
          answers =answers.concat(
            mquestions.map((item) => item.correctOption),
            nquestions.map((item) => item.correctOption)
          )
        }
      } else {
        const subjects = ['bio', 'physics', 'chemistry']
        subjects1 = subjects
        for (let i = 0; i < 3; i++) {
          const model = msubjectToModelMap[subjects[i]][exam]
          if (!model) {
            throw new Error('Invalid subject or exam type.')
          }
          const questions = await getRandomQuestions(
            model,
            difficulty,
            mult / 3
          )
          questionIds = questionIds.concat(questions.map((item) => item._id))
          answers =answers.concat(
            questions.map((item) => item.correctOption),
          )
        }
      }
    } else {
      subjects1[0]=subject
      const Model = msubjectToModelMap[subject][exam]
      if (!Model) {
        throw new Error('Invalid subject or exam type.')
      }

      const mQuestions = await getRandomQuestions(Model, difficulty, mult)
      questionIds = mQuestions.map((item) => item._id)
          answers = mQuestions.map((item) => item.correctOption)

      if (exam === 'jee') {
        const nModel =
          nsubjectToModelMap[subject]
        if (!nModel) {
          throw new Error('Invalid subject or exam type.')
        }
        const nQuestions = await getRandomQuestions(nModel, difficulty, num)
        questionIds = questionIds.concat(nQuestions.map((item) => item._id))
        answers = answers.concat(nQuestions.map((item) => item.correctOption))
      }
    }
    const paper = new Test({
      name: req.body.name,
      subject: subjects1,
      exam: req.body.exam,
      num:req.body.num,
      totalQuestions: req.body.totalQuestions,
      date: new Date().toLocaleString(),
      questionIds,
      answers:answers
    })

    await paper.save()
    res.send(paper).end()
  } catch (error) {
    res.status(401).send(error.message).end()
  }
})

module.exports = router
