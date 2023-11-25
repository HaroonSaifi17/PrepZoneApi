const express = require('express')
const fetch = require('node-fetch')
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

app.get('/ping',(req,res)=>{
  try {
    res.status(200).end() 
  } catch (error) {
      res.status(401).send(error.message).end()
  }
})

app.post('/contactForm',async (req,res)=>{
  apiKey=process.env.BOT_API_TOKEN
  try {
   const response = await fetch(`https://api.telegram.org/bot${apiKey}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: 1233632774,
        text: req.body,
      }),
    }); 
    res.status(200).end()
  } catch (error) {
      res.status(401).send(error.message).end()
  }
})

async function pingAPI() {
  try {
    const response = await fetch('https://server.haroonsaifi.site/ping');
    if (response.ok) {
      console.log('Ping successful');
    } else {
      console.log('Ping failed');
    }
  } catch (error) {
    console.error('Error occurred while pinging API:', error);
  }
}
const interval = 10 * 60 * 1000;
setInterval(pingAPI, interval);


app.listen(process.env.PORT || port, () => {
  console.log(`Server is listening at http://localhost:${port} `)
})

