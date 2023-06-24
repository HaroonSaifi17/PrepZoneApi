const router = require('express').Router()
const Student = require('../models/student')


router.get('/',async (req, res) => {
  try {
    res.send('works').status(200).end()
  } catch (error) {
    res.status(401).json({ message: 'Invalid Google token' });
  }
})

module.exports = router
