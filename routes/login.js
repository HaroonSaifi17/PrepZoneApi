const router = require('express').Router()
const passport = require('passport')
var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: '94004341890-n5p6bivcp3hgi04q8ssavsst61vpp55a.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://localhost:4040/login/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      return done(profile);
  }
));

passport.serializeUser(function (user,done){
  done(null,user)
})
passport.deserializeUser(function (user,done){
  done(null,user)
})

router.get('/',
    passport.authenticate('google',{scope:['email','profile']})
)
router.get('/callback', 
  passport.authenticate('google', { failureRedirect: '/login',successReturnToOrRedirect:'/student' }));

module.exports = router
