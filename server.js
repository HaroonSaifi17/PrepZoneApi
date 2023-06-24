const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')
const cookieparser = require('cookie-parser')
require('dotenv').config()

const studentRouter = require('./routes/student')
const loginRouter = require('./routes/login')

const app = express()
const port = 4040

app.use(cookieparser())
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: 'haroonsaifi',
    resave: false,
    saveUninitialized: false,
  })
)
app.use(passport.initialize())
app.use(passport.session())

mongoose
  .connect(process.env.BLOGDB_CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB Atlas')
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error)
  })

app.use(
  cors({
    origin: '*',
    optionsSuccessStatus: 200,
  })
)

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401)
}

app.use('/login', loginRouter)
//app.use(isLoggedIn())
app.use('/student', studentRouter)

app.get('logout', (req, res) => {
  try {
    res.logout()
    res.status(200).end()
  } catch (error) {
    res.status(401).json({ message: 'Invalid Google token' })
  }
})

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port} `)
})
