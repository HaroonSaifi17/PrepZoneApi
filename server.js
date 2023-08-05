const express = require('express')
const cors = require('cors')
require('dotenv').config()

const studentRouter = require('./routes/student')
const loginRouter = require('./routes/login')
const notesRouter = require('./routes/notes')
const adminRouter = require('./routes/admin')

const app = express()
const port = process.env.PORT
app.use(cors({ origin: '*', optionsSuccessStatus: 200 }))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
require('./setup/mongoose')
require('./setup/passport')

app.use('/login', loginRouter)
app.use('/student', studentRouter)
app.use('/admin', adminRouter)
app.use('/notes', notesRouter)

app.listen(process.env.PORT || port, () => {
  console.log(`Server is listening at http://localhost:${port} `)
})
