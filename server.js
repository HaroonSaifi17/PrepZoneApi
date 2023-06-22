const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const studentRouter = require('./routes/student')

const app = express()
const port = 4040

mongoose.connect(
  process.env.BLOGDB_CONNECTION_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
).then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

app.use(
  cors({
    origin: '*',
    optionsSuccessStatus: 200,
  })
)

app.use('/student', studentRouter)

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port} `)
})
