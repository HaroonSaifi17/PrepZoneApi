const router = require('express').Router()
const Student = require('../models/student')
const passport = require('passport')
const jwt = require('jsonwebtoken')

router.get(
  '/data',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const data = await Student.findById(req.user.userId).exec()
      if (data) {
        res.json(data)
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
      const data = await Student.findById(req.user.userId).exec()
      if (data) {
        if(typeof data.phoneNumber === 'undefined'){
          res.send({ isNew: false }).end()
        }
        else{
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
      const data = {
        name:'Haroon Saifi',
        topMarks: 220,
        averageMarks: 180,
        physicsAccuracy: 75,
        chemistryAccuracy: 80,
        mathAccuracy: 50,
        mathTime: 1.5,
        chemistryTime: 1,
        physicsTime: 2,
      }
      res.json(data)
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
      const data = {
        name:'Haroon Saifi',
        topMarks: 220,
        averageMarks: 180,
        physicsAccuracy: 75,
        chemistryAccuracy: 80,
        bioAccuracy: 50,
        bioTime: 1.5,
        chemistryTime: 1,
        physicsTime: 2,
      }
      res.json(data)
    } catch (error) {
      res.status(401).send(error.message).end()
    }
  }
)

module.exports = router
