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

module.exports = router
