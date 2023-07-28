const {
  JPhysicsQuestion,
  JChemistryQuestion,
  JMathQuestion,
  NBiologyQuestion,
  NPhysicsQuestion,
  NChemistryQuestion,
  JMathNumQuestion,
  JChemistryNumQuestion,
  JPhysicsNumQuestion,
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
  math: JMathQuestion,
  bio: NBiologyQuestion,
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
  math: JMathNumQuestion,
  physics: JPhysicsNumQuestion,
  chmistry: JChemistryNumQuestion,
}

router.post('/addMQuestion', async (req, res) => {
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
    })

    await question.save()
    res.status(200).end()
  } catch (error) {
    res.status(401).send(error.message).end()
  }
})

router.post('/addNQuestion', async (req, res) => {
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
    })

    await question.save()
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

    if (subject === 'all') {
      if (exam === 'jee') {
        const subjects = ['math', 'physics', 'chemistry']
        subjects1=subjects
        for (let i = 0; i < 3; i++) {
          const mmodel = msubjectToModelMap[subjects[i]][exam]
          const nmodel = msubjectToModelMap[subjects[i]]
          if (!mmodel && !nmodel) {
            throw new Error('Invalid subject or exam type.')
          }

          const mquestions = await getRandomQuestions(
            nmodel,
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

      if (exam === 'jee') {
        const nModel =
          nsubjectToModelMap[subject][exam]
        if (!nModel) {
          throw new Error('Invalid subject or exam type.')
        }
        const nQuestions = await getRandomQuestions(nModel, difficulty, num)
        questionIds = questionIds.concat(nQuestions.map((item) => item._id))
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
    })

    await paper.save()
    res.send(paper).end()
  } catch (error) {
    res.status(401).send(error.message).end()
  }
})

module.exports = router
