const router = require('express').Router();
const Student = require('../models/student');
const Test = require('../models/test');
const passport = require('passport');

const authenticateJWT = passport.authenticate('jwt', { session: false });

async function getStudentDataById(userId, fields) {
  try {
    const data = await Student.findById(userId).select(fields).exec();
    if (data) {
      return data;
    } else {
      throw new Error('Data not found');
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

router.get('/profileImg', authenticateJWT, async (req, res) => {
  try {
    const data = await getStudentDataById(req.user.userId, 'profileImg');
    res.send(data).end();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/profileData', authenticateJWT, async (req, res) => {
  try {
    const data = await getStudentDataById(
      req.user.userId,
      'profileImg name email phoneNumber prep'
    );
    res.send(data).end();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/newStudentPost', authenticateJWT, async (req, res) => {
  try {
    const data = await getStudentDataById(req.user.userId, 'name phoneNumber prep');
    data.name = req.body.name;
    data.phoneNumber = req.body.phoneNumber;
    data.prep = req.body.prep;
    await data.save();
    res.status(200).end();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/checkNew', authenticateJWT, async (req, res) => {
  try {
    const data = await getStudentDataById(req.user.userId, 'phoneNumber');
    if (typeof data.phoneNumber === 'undefined') {
      res.send({ isNew: false, name: data.name }).end();
    } else {
      res.send({ isNew: true }).end();
    }
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/jeeData', authenticateJWT, async (req, res) => {
  try {
    const data = await getStudentDataById(
      req.user.userId,
      'name topMarks averageMarks physicsAccuracy chemistryAccuracy mathAccuracy mathTime chemistryTime physicsTime'
    );
    const data1 = {
      name: data.name,
      topMarks: data.topMarks[0],
      averageMarks: data.averageMarks[0],
      physicsAccuracy: data.physicsAccuracy[0],
      chemistryAccuracy: data.chemistryAccuracy[0],
      mathAccuracy: data.mathAccuracy,
      mathTime: data.mathTime,
      chemistryTime: data.chemistryAccuracy[0],
      physicsTime: data.physicsAccuracy[0],
    };
    res.json(data1);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/neetData', authenticateJWT, async (req, res) => {
  try {
    const data = await getStudentDataById(
      req.user.userId,
      'name topMarks averageMarks physicsAccuracy chemistryAccuracy bioAccuracy bioTime chemistryTime physicsTime'
    );
    const data1 = {
      name: data.name,
      topMarks: data.topMarks[0],
      averageMarks: data.averageMarks[0],
      physicsAccuracy: data.physicsAccuracy[0],
      chemistryAccuracy: data.chemistryAccuracy[0],
      bioAccuracy: data.bioAccuracy,
      bioTime: data.bioTime,
      chemistryTime: data.chemistryAccuracy[0],
      physicsTime: data.physicsAccuracy[0],
    };
    res.json(data1);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/getTest', authenticateJWT, async (req, res) => {
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

      const tests = await Test.find({ name: { $regex: search, $options: 'i' } })
        .where('subject')
        .in([...genre])
        .sort({ date: sort })
        .skip(page * limit)
        .limit(limit)
        .select('name totalQuestions exam date')

      const total = await Test.countDocuments({
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
        tests,
        pageno,
      }
      res.status(200).json(response)
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});


module.exports = router;

