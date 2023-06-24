const router = require('express').Router()
const passport = require('passport')
var GoogleStrategy = require('passport-google-oauth20').Strategy

passport.use(
  new GoogleStrategy(
    {
      clientID:
        '94004341890-n5p6bivcp3hgi04q8ssavsst61vpp55a.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:4040/login/callback',
    },
    async (req, accessToken, refreshToken, profile, done) => {
      done(null, profile)
    }
  )
)

passport.serializeUser(function (user, done) {
  done(null, user)
})
passport.deserializeUser(function (user, done) {
  done(null, user.id)
})

router.get(
  '/',
  passport.authenticate('google', { scope: ['email', 'profile'] })
)
router.get(
  '/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    successReturnToOrRedirect: 'http://localhost:4200/student',
  })
)

module.exports = router
