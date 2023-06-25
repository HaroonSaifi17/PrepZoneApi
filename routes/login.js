const router = require('express').Router()
const passport = require('passport')
var GoogleStrategy = require('passport-google-oauth20').Strategy

passport.use(
  new GoogleStrategy(
    {
      clientID:process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
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
    successReturnToOrRedirect: process.env.REDIRECT_URL,
  })
)

module.exports = router
