const router = require('express').Router()
const Student = require('../models/student')

router.get('/', async (req, res) => {
  try {
    res.status(200).json(response)
  } catch (err) {
    res.status(500).json(err.message)
  }
})

module.exports = router
