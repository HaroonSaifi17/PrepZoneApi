const passport = require('passport')
const Student = require('./../models/student')
var GoogleStrategy = require('passport-google-oauth20').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const Strategy = require('passport-jwt').Strategy

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      done(null, profile)
    }
  )
)

var options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
}
passport.use(
  new Strategy(options, (payload, done) => {
    return done(null, payload)
  })
)
