const router = require('express').Router()
const path = require('path');
const passport = require('passport')
const Pdf = require('../models/notes')

const multer = require('multer')
const fs = require('fs')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './files/pdf')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length
    )
    let name = file.fieldname + '-' + uniqueSuffix + ext
    cb(null, name)
  },
})

const upload = multer({ storage: storage ,limits: {
    fileSize: 10 * 1024 * 1024, 
  }})
router.post('/', 
  passport.authenticate('adminJwt', { session: false }),
  upload.single('pdf'), async (req, res) => {
  try {
    const pdf = new Pdf({
      name: req.body.name,
      subject: req.body.subject,
      url: req.file.filename,
      date: new Date().toLocaleString(),
    })
    await pdf.save()
    res.status(200).end()
  } catch (error) {
    res.status(401).send(error.message).end()
  }
})
router.get(
  '/pdf/:url',
  async (req, res) => {
    try {
      const fileUrl = req.params.url;
    const filePath = path.join(__dirname, '../files/pdf/', fileUrl);
      res.sendFile(filePath)
    } catch (error) {
      res.status(401).send(error.message).end()
    }
  }
)
router.get(
  '/pdfs',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) - 1 || 0
      const limit = parseInt(req.query.limit) || 10
      const search = req.query.search || ''
      let sort = parseInt(req.query.sort) || -1
      let genre = req.query.subject || 'All'
      let pageno = [1]
      const genreOptions = ['physics', 'chemistry', 'math', 'biology']

      genre === 'All'
        ? (genre = [...genreOptions])
        : (genre = req.query.subject.split(','))

      const pdfs = await Pdf.find({ name: { $regex: search, $options: 'i' } })
        .where('subject')
        .in([...genre])
        .sort({ date: sort })
        .skip(page * limit)
        .limit(limit)
        .select('name url')

      const total = await Pdf.countDocuments({
        subject: { $in: [...genre] },
        name: { $regex: search, $options: 'i' },
      })

      let totalpage = total / limit
      if (totalpage > 1) {
        for (let i = 1; i < totalpage; i++) {
          pageno.push(i + 1)
        }
      }
      const response = {
        error: false,
        total,
        page: page + 1,
        limit,
        pdfs,
        pageno,
      }
      res.status(200).json(response)
    } catch (error) {
      res.status(401).send(error.message).end()
    }
  }
)

module.exports = router
