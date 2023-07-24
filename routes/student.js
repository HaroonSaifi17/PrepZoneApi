const router = require('express').Router();
const Student = require('../models/student');
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

module.exports = router;

