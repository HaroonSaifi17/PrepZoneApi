const router = require('express').Router()
const Student = require('../models/student')
const passport = require('passport')
const jwt = require('jsonwebtoken')

router.get('/',passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    res.send("hello").end()
  } catch (error) {
    res.status(401).send(error.message).end()
  }
})

module.exports = router
