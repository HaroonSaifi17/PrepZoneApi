const { OAuth2Client } = require('google-auth-library');
const router = require('express').Router()
const Student = require('../models/student')

const client = new OAuth2Client('94004341890-n5p6bivcp3hgi04q8ssavsst61vpp55a.apps.googleusercontent.com');

router.post('/setup-profile',async (req, res) => {
    const googleToken = req.body.token;
  console.log(googleToken, req)
  try {
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: '94004341890-n5p6bivcp3hgi04q8ssavsst61vpp55a.apps.googleusercontent.com',
    });
    res.json(ticket.getPayload());
  } catch (error) {
    console.error('Error verifying Google token:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
})

module.exports = router
