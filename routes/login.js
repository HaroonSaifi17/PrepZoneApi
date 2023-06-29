const passport = require('passport')
const router = require('express').Router()
const jwt = require('jsonwebtoken')

router.get(
  '/',
  passport.authenticate('google', { scope: ['email', 'profile'],session:false })
)
router.get(
  '/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session:false
  }),(req,res)=>{
   try {
      const token = jwt.sign({userId:req.user.id, userEmail:req.user._json.email },process.env.JWT_SECRET,{
      expiresIn: '10h' 
    })
      res.setHeader('Authorization', `Bearer ${token}`);
      res.redirect(process.env.REDIRECT_URL);
   } catch (error) {
    res.status(401).send(error.message).end()
   }
  }
)

module.exports = router
