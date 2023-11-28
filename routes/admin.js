const {
  JPhysicsQuestion,
  JChemistryQuestion,
  JMathQuestion,
  NBiologyQuestion,
  NPhysicsQuestion,
  NChemistryQuestion,
  MathNumQuestion,
  ChemistryNumQuestion,
  PhysicsNumQuestion,
} = require("../models/question");

const Test = require("../models/test");
const Student = require("../models/student");
const Pdf = require("../models/notes");
const path = require("path");
const router = require("express").Router();
const fs = require("fs");

async function getRandomQuestions(Model, difficulty, num) {
  let questions = [];
  if (num != 0) {
    questions = await Model.aggregate([
      { $match: { difficulty: { $eq: difficulty } } },
      { $sample: { size: num } },
    ]).exec();
  }
  if (questions.length < num) {
    return {
      error: `Not enough questions available in the database for difficulty level '${difficulty}' and requested quantity '${num}'.`,
    };
  }
  return questions;
}
const msubjectToModelMap = {
  math: { jee: JMathQuestion },
  bio: { neet: NBiologyQuestion },
  physics: {
    jee: JPhysicsQuestion,
    neet: NPhysicsQuestion,
  },
  chemistry: {
    jee: JChemistryQuestion,
    neet: NChemistryQuestion,
  },
};
const nsubjectToModelMap = {
  math: MathNumQuestion,
  physics: PhysicsNumQuestion,
  chemistry: ChemistryNumQuestion,
};
const multer = require("multer");
const passport = require("passport");

const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files/questionImages");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    let imgName = file.fieldname + "-" + uniqueSuffix + ext;
    cb(null, imgName);
  },
});

const upload1 = multer({
  storage: storage1,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.get(
  "/check",
  passport.authenticate("adminJwt", { session: false }),
  async (req, res) => {
    try {
      res.send({ check: true }).status(200).end();
    } catch (error) {
      res.status(401).send(error.message).end();
    }
  }
);

router.post(
  "/addMQuestion",
  passport.authenticate("adminJwt", { session: false }),
  upload1.single("img"),
  async (req, res) => {
    try {
      const {
        subject,
        exam,
        difficulty,
        questionText,
        options,
        correctOption,
      } = req.body;
      const Model = msubjectToModelMap[subject][exam];
      if (!Model) {
        throw new Error("Invalid subject or exam type.");
      }
      let name = "";
      if (req.file != undefined) {
        name = req.file.filename;
      }
      const question = new Model({
        difficulty,
        questionText,
        options,
        correctOption,
        img: name,
      });
      await question.save();
      const questionIdString = question._id.toString();
      res.send({ id: questionIdString }).status(200).end();
    } catch (error) {
      res.status(401).send(error.message).end();
    }
  }
);

router.post(
  "/addNQuestion",
  passport.authenticate("adminJwt", { session: false }),
  upload1.single("img"),
  async (req, res) => {
    try {
      const { subject, difficulty, questionText, correctOption } = req.body;

      const Model = nsubjectToModelMap[subject];
      if (!Model) {
        throw new Error("Invalid subject");
      }
      let name = "";
      if (req.file != undefined) {
        name = req.file.filename;
      }

      const question = new Model({
        difficulty,
        questionText,
        correctOption,
        img: name,
      });
      await question.save();
      const questionIdString = question._id.toString();
      res.send({ id: questionIdString }).status(200).end();
    } catch (error) {
      res.status(401).send(error.message).end();
    }
  }
);

router.get(
  "/GeneratePaper",
  passport.authenticate("adminJwt", { session: false }),
  async (req, res) => {
    try {
      const { subject, exam, difficulty, totalQuestions, num, name } =
        req.query;

      let mult = totalQuestions - num;
      let questionIds = [];
      let subjects1 = [];
      let answers = [];

      if (subject === "all") {
        if (exam === "jee") {
          const subjects = ["math", "physics", "chemistry"];
          subjects1 = subjects;
          for (let i = 0; i < 3; i++) {
            const mmodel = msubjectToModelMap[subjects[i]][exam];
            const nmodel = nsubjectToModelMap[subjects[i]];
            if (!mmodel && !nmodel) {
              throw new Error("Invalid subject or exam type.");
            }

            const mquestions = await getRandomQuestions(
              mmodel,
              difficulty,
              mult / 3
            );
            if (mquestions.error) {
              throw new Error(mquestions.error);
            }
            const nquestions = await getRandomQuestions(
              nmodel,
              difficulty,
              num / 3
            );
            if (nquestions.error) {
              throw new Error(nquestions.error);
            }
            questionIds = questionIds.concat(
              mquestions.map((item) => item._id),
              nquestions.map((item) => item._id)
            );
            answers = answers.concat(
              mquestions.map((item) => item.correctOption),
              nquestions.map((item) => item.correctOption)
            );
          }
        } else {
          const subjects = ["bio", "physics", "chemistry"];
          subjects1 = subjects;
          for (let i = 0; i < 3; i++) {
            const model = msubjectToModelMap[subjects[i]][exam];
            if (!model) {
              throw new Error("Invalid subject or exam type.");
            }
            const questions = await getRandomQuestions(
              model,
              difficulty,
              mult / 3
            );
            if (questions.error) {
              throw new Error(questions.error);
            }
            questionIds = questionIds.concat(questions.map((item) => item._id));
            answers = answers.concat(
              questions.map((item) => item.correctOption)
            );
          }
        }
      } else {
        subjects1[0] = subject;
        const Model = msubjectToModelMap[subject][exam];
        if (!Model) {
          throw new Error("Invalid subject or exam type.");
        }

        const mQuestions = await getRandomQuestions(Model, difficulty, mult);
        if (mQuestions.error) {
          throw new Error(mQuestions.error);
        }
        questionIds = mQuestions.map((item) => item._id);
        answers = mQuestions.map((item) => item.correctOption);

        if (exam === "jee") {
          const nModel = nsubjectToModelMap[subject];
          if (!nModel) {
            throw new Error("Invalid subject or exam type.");
          }
          const nQuestions = await getRandomQuestions(nModel, difficulty, num);
          if (nQuestions.error) {
            throw new Error(nQuestions.error);
          }
          questionIds = questionIds.concat(nQuestions.map((item) => item._id));
          answers = answers.concat(
            nQuestions.map((item) => item.correctOption)
          );
        }
      }
      const paper = new Test({
        name: name,
        subject: subjects1,
        exam: exam,
        num: num,
        totalQuestions: totalQuestions,
        date: new Date().toLocaleString(),
        questionIds,
        answers: answers,
      });

      await paper.save();
      res.status(200).end();
    } catch (error) {
      if (error.statusCode) {
        res.status(error.statusCode).send(error.message).end();
      } else {
        res.status(400).send(error.message).end();
      }
    }
  }
);

router.post(
  "/CreatePaper",
  passport.authenticate("adminJwt", { session: false }),
  async (req, res) => {
    try {
      const { subject, exam, totalQuestions, num, name, questionIds, answers } =
        req.body;
      const paper = new Test({
        name: name,
        subject: JSON.parse(subject),
        exam: exam,
        num: num,
        totalQuestions: totalQuestions,
        date: new Date().toLocaleString(),
        questionIds: JSON.parse(questionIds),
        answers: JSON.parse(answers),
      });
      await paper.save();
      res.status(200).end();
    } catch (error) {
      res.status(401).send(error.message).end();
    }
  }
);

router.get(
  "/getTests",
  passport.authenticate("adminJwt", { session: false }),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) - 1 || 0;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";
      let sort = parseInt(req.query.sort) || -1;
      let genre = req.query.subject || "All";
      let pageno = [1];
      const genreOptions = ["physics", "chemistry", "math", "bio"];

      genre === "All"
        ? (genre = [...genreOptions])
        : (genre = req.query.subject.split(","));

      const tests = await Test.find({ name: { $regex: search, $options: "i" } })
        .where("subject")
        .in([...genre])
        .sort({ date: sort })
        .skip(page * limit)
        .limit(limit)
        .lean()
        .select("_id name totalQuestions exam date")
        .exec();

      const total = await Test.countDocuments({
        subject: { $in: [...genre] },
        name: { $regex: search, $options: "i" },
      });

      let totalpage = total / limit;
      if (totalpage > 1) {
        for (let i = 1; i < totalpage; i++) {
          pageno.push(i + 1);
        }
      }
      tests.forEach((test) => {
        test._id = test._id.toString();
      });
      const response = {
        error: false,
        total,
        page: page + 1,
        limit,
        tests,
        pageno,
      };
      res.status(200).json(response);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
);
router.get(
  "/deleteTest/:id",
  passport.authenticate("adminJwt", { session: false }),
  async (req, res) => {
    try {
      const id = req.params.id;
      await Test.findByIdAndDelete(id);
      res.status(200).end();
    } catch (error) {
      res.status(401).send(error.message).end();
    }
  }
);
router.get(
  "/deletePdf/:id",
  passport.authenticate("adminJwt", { session: false }),
  async (req, res) => {
    try {
      const id = req.params.id;
      await Pdf.findOneAndDelete({ url: id });
      const filePath = path.join(__dirname, "../files/pdf/", id);
      fs.unlink(filePath, function (err) {
        if (err) return console.log(err);
        res.status(200).end();
        return
      });
        res.status(200).end();
    } catch (error) {
      res.status(401).send(error.message).end();
    }
  }
);
router.get(
  "/pdf/:url",
  passport.authenticate("adminJwt", { session: false }),
  async (req, res) => {
    try {
      const fileUrl = req.params.url;
      const filePath = path.join(__dirname, "../files/pdf/", fileUrl);
      res.sendFile(filePath);
    } catch (error) {
      res.status(401).send(error.message).end();
    }
  }
);
router.get(
  "/pdfs",
  passport.authenticate("adminJwt", { session: false }),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) - 1 || 0;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";
      let sort = parseInt(req.query.sort) || -1;
      let genre = req.query.subject || "All";
      let pageno = [1];
      const genreOptions = ["physics", "chemistry", "math", "biology"];

      genre === "All"
        ? (genre = [...genreOptions])
        : (genre = req.query.subject.split(","));

      const pdfs = await Pdf.find({ name: { $regex: search, $options: "i" } })
        .where("subject")
        .in([...genre])
        .sort({ date: sort })
        .skip(page * limit)
        .limit(limit)
        .select("name url");

      const total = await Pdf.countDocuments({
        subject: { $in: [...genre] },
        name: { $regex: search, $options: "i" },
      });

      let totalpage = total / limit;
      if (totalpage > 1) {
        for (let i = 1; i < totalpage; i++) {
          pageno.push(i + 1);
        }
      }
      const response = {
        error: false,
        total,
        page: page + 1,
        limit,
        pdfs,
        pageno,
      };
      res.status(200).json(response);
    } catch (error) {
      res.status(401).send(error.message).end();
    }
  }
);

router.get(
  "/dashboard",
  passport.authenticate("adminJwt", { session: false }),
  async (req, res) => {
    try {
     const totalStudent = await Student.countDocuments()
     const jeePhysics = await JPhysicsQuestion.countDocuments()
     const jeeChemistry = await JChemistryQuestion.countDocuments()
     const jeeMath = await JMathQuestion.countDocuments()
     const numPhysics = await PhysicsNumQuestion.countDocuments()
     const numChemistry = await ChemistryNumQuestion.countDocuments()
     const numMath = await MathNumQuestion.countDocuments()
     const neetPhysics = await NPhysicsQuestion.countDocuments()
     const neetChemistry = await NChemistryQuestion.countDocuments()
     const neetBio = await NBiologyQuestion.countDocuments()
      const response ={
        totalStudent,
        jeePhysics,
        jeeChemistry,
        jeeMath,
        numPhysics,
        numChemistry,
        numMath,
        neetPhysics,
        neetChemistry,
        neetBio
      }
      res.status(200).json(response);
    } catch (error) {
      res.status(401).send(error.message).end();
    }
  }
);

module.exports = router;
