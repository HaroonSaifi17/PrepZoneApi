const router = require('express').Router()
const Student = require('../models/student')
const passport = require('passport')
const jwt = require('jsonwebtoken')

router.get(
  '/profileImg',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const data = await Student.findById(req.user.userId)
        .select('profileImg')
        .exec()
      if (data) {
        res.send(data).end()
      } else {
        res.status(404).json({ error: 'Data not found' })
      }
    } catch (error) {
      res.status(401).send(error.message).end()
    }
  }
)
router.get(
  '/profileData',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const data = await Student.findById(req.user.userId)
        .select('profileImg name email phoneNumber prep')
        .exec()
      if (data) {
        res.send(data).end()
      } else {
        res.status(404).json({ error: 'Data not found' })
      }
    } catch (error) {
      res.status(401).send(error.message).end()
    }
  }
)
router.post(
  '/newStudentPost',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const data = await Student.findById(req.user.userId)
        .select('name phoneNumber prep')
        .exec()
      if (data) {
        data.name = req.body.name
        data.phoneNumber = req.body.phoneNumber
        data.prep = req.body.prep
        await data.save()
        res.status(200).end()
      } else {
        res.status(404).json({ error: 'Data not found' })
      }
    } catch (error) {
      res.status(401).send(error.message).end()
    }
  }
)
router.get(
  '/checkNew',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const data = await Student.findById(req.user.userId)
        .select('phoneNumber')
        .exec()
      if (data) {
        if (typeof data.phoneNumber === 'undefined') {
          res.send({ isNew: false, name: data.name }).end()
        } else {
          res.send({ isNew: true }).end()
        }
      } else {
        res.status(404).json({ error: 'Data not found' })
      }
    } catch (error) {
      res.status(401).send(error.message).end()
    }
  }
)
router.get(
  '/jeeData',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const data = await Student.findById(req.user.userId)
        .select(
          'name topMarks averageMarks physicsAccuracy chemistryAccuracy mathAccuracy mathTime chemistryTime physicsTime'
        )
        .exec()
      if (data) {
      } else {
        res.status(404).json({ error: 'Data not found' })
      }
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
      res.status(401).send(error.message).end()
    }
  }
)
router.get(
  '/neetData',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const data = await Student.findById(req.user.userId)
        .select(
          'name topMarks averageMarks physicsAccuracy chemistryAccuracy bioAccuracy mbioTime chemistryTime physicsTime'
        )
        .exec()
      if (data) {
      } else {
        res.status(404).json({ error: 'Data not found' })
      }
      const data1 = {
        name: data.name,
        topMarks: data.topMarks[0],
        averageMarks: data.averageMarks[0],
        physicsAccuracy: data.physicsAccuracy[0],
        chemistryAccuracy: data.chemistryAccuracy[0],
        bioAccuracy: data.bioAccuracy,
        bioTime: data.bioTime,
        chemistryTime: data.chemistryAccuracy[0],
        physicsTime: data.physicsAccuracy[0],
      }
      res.json(data1)
    } catch (error) {
      res.status(401).send(error.message).end()
    }
  }
)

module.exports = router
