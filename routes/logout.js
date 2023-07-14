const router = require('express').Router()

router.get('/',passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    req.logout()
  } catch (error) {
    res.status(401).send(error.message).end()
  }
})

module.exports = router
