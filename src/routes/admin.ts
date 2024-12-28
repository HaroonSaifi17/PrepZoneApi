import { Router } from "express";
import asyncWrapper from "../utils/asyncWrapper";
import path from "path";
import fs from "fs";
import {
  JPhysicsQuestion,
  JChemistryQuestion,
  JMathQuestion,
  NBiologyQuestion,
  NPhysicsQuestion,
  NChemistryQuestion,
  MathNumQuestion,
  ChemistryNumQuestion,
  PhysicsNumQuestion,
  INumericalQuestion,
} from "../models/question";
import Test from "../models/test";
import Student, { IResult } from "../models/student";
import Pdf from "../models/notes";
import multer from "multer";
import passport from "passport";
import { Model, SortOrder } from "mongoose";
import { IQuestion } from "../models/question";

const router = Router();

async function getRandomQuestions<T>(
  Model: Model<T> | Model<INumericalQuestion>,
  difficulty: string,
  num: number,
) {
  let questions: T[] = [];
  if (num !== 0) {
    questions = await Model.aggregate([
      { $match: { difficulty: { $eq: difficulty } } },
      { $sample: { size: num } },
    ]).exec();
  }
  if (questions.length < num) {
    throw new Error(
      `Not enough questions available in the database for difficulty level '${difficulty}' and requested quantity '${num}'.`,
    );
  }
  return questions;
}
type nSubjectModel = Model<INumericalQuestion>;

const nsubjectToModelMap: Record<string, nSubjectModel> = {
  math: MathNumQuestion,
  physics: PhysicsNumQuestion,
  chemistry: ChemistryNumQuestion,
} as const;
type mSubjectModel = Model<IQuestion>;

const msubjectToModelMap: Record<string, Record<string, mSubjectModel>> = {
  math: { jee: JMathQuestion },
  bio: { neet: NBiologyQuestion },
  physics: { jee: JPhysicsQuestion, neet: NPhysicsQuestion },
  chemistry: { jee: JChemistryQuestion, neet: NChemistryQuestion },
};

const storage1 = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "./src/files/questionImages");
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length,
    );
    const imgName = file.fieldname + "-" + uniqueSuffix + ext;
    cb(null, imgName);
  },
});

const upload1 = multer({
  storage: storage1,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post(
  "/addMQuestion",
  passport.authenticate("adminJwt", { session: false }),
  upload1.single("img"),
  asyncWrapper(async (req, res) => {
    const { subject, exam, difficulty, questionText, correctOption, options } =
      req.body;
    const Model = msubjectToModelMap[subject][exam];
    if (!Model) {
      throw new Error("Invalid subject or exam type.");
    }
    let name = "";
    if (typeof req.file !== "undefined") {
      name = req.file.filename;
    }
    const question = new Model({
      difficulty,
      questionText,
      options: JSON.parse(options),
      correctOption,
      img: name,
    });
    await question.save();
    const questionIdString = question.id.toString();
    res.send({ id: questionIdString }).status(200).end();
  }),
);

router.post(
  "/addNQuestion",
  passport.authenticate("adminJwt", { session: false }),
  upload1.single("img"),
  asyncWrapper(async (req, res) => {
    const { subject, difficulty, questionText, correctOption } = req.body;

    const Model = nsubjectToModelMap[subject];
    if (!Model) {
      throw new Error("Invalid subject");
    }
    let name = "";
    if (typeof req.file != "undefined") {
      name = req.file.filename;
    }

    const question = new Model({
      difficulty,
      questionText,
      correctOption,
      img: name,
    });
    await question.save();
    const questionIdString = question.id.toString();
    res.send({ id: questionIdString }).status(200).end();
  }),
);

router.get(
  "/GeneratePaper",
  passport.authenticate("adminJwt", { session: false }),
  asyncWrapper(async (req, res) => {
    const exam: string = req.query.exam as string;
    const difficulty: string = req.query.difficulty as string;
    const totalQuestions: number = parseInt(req.query.totalQuestions as string);
    const num: number = parseInt(req.query.num as string);
    const name: string = req.query.name as string;
    if (!exam || !difficulty || !totalQuestions || !num || !name) {
      throw new Error("Invalid parameters.");
    }
    const subject = JSON.parse(req.query.subject as string);
    if (subject.length === 0) {
      throw new Error("Invalid subject.");
    }

    const mult = totalQuestions - num;
    let questionIds: string[] = [];
    let answers: number[] = [];

    if (subject.length > 1) {
      if (exam === "jee") {
        for (let i = 0; i < 3; i++) {
          const mmodel = msubjectToModelMap[subject[i]][exam];
          const nmodel = nsubjectToModelMap[subject[i]];
          if (!mmodel && !nmodel) {
            throw new Error("Invalid subject or exam type.");
          }

          const mquestions: IQuestion[] = await getRandomQuestions(
            mmodel,
            difficulty,
            mult / 3,
          );
          const nquestions: IQuestion[] = await getRandomQuestions(
            nmodel,
            difficulty,
            num / 3,
          );

          questionIds = questionIds.concat(
            mquestions.map((item) => item._id as string),
            nquestions.map((item) => item._id as string),
          );
          answers = answers.concat(
            mquestions.map((item) => item.correctOption as number),
            nquestions.map((item) => item.correctOption as number),
          );
        }
      } else {
        for (let i = 0; i < 3; i++) {
          const model = msubjectToModelMap[subject[i]][exam];
          if (!model) {
            throw new Error("Invalid subject or exam type.");
          }
          const questions = await getRandomQuestions(
            model,
            difficulty,
            mult / 3,
          );
          questionIds = questionIds.concat(
            questions.map((item) => item._id as string),
          );
          answers = answers.concat(
            questions.map((item) => item.correctOption as number),
          );
        }
      }
    } else {
      const Model = msubjectToModelMap[subject[0]][exam];
      if (!Model) {
        throw new Error("Invalid subject or exam type.");
      }

      const mQuestions = await getRandomQuestions(Model, difficulty, mult);
      questionIds = mQuestions.map((item) => item._id as string);
      answers = mQuestions.map((item) => item.correctOption as number);

      if (exam === "jee") {
        const nModel = nsubjectToModelMap[subject[0]];
        if (!nModel) {
          throw new Error("Invalid subject or exam type.");
        }
        const nQuestions = await getRandomQuestions(nModel, difficulty, num);
        questionIds = questionIds.concat(
          nQuestions.map((item) => item._id as string),
        );
        answers = answers.concat(
          nQuestions.map((item) => item.correctOption as number),
        );
      }
    }
    const paper = new Test({
      name: name,
      subject: subject,
      exam: exam,
      num: num,
      totalQuestions: totalQuestions,
      date: new Date().toLocaleString(),
      questionIds,
      answers: answers,
    });

    await paper.save();
    res.status(200).end();
  }),
);

router.post(
  "/CreatePaper",
  passport.authenticate("adminJwt", { session: false }),
  asyncWrapper(async (req, res) => {
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
  }),
);

router.get(
  "/getTests",
  passport.authenticate("adminJwt", { session: false }),
  asyncWrapper(async (req, res) => {
    const page = parseInt(req.query.page as string) - 1 || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search || "";
    const sort = parseInt(req.query.sort as string) || -1;
    let genre: string[] = [(req.query.subject as string) || "All"];
    const pageno = [1];
    const genreOptions = ["physics", "chemistry", "math", "bio"];

    if (genre[0] === "All") {
      genre = [...genreOptions];
    } else {
      genre = (req.query.subject as string).split(",");
    }

    const tests = await Test.find({ name: { $regex: search, $options: "i" } })
      .where("subject")
      .in([...genre])
      .sort({ date: sort as 1 | -1 })
      .skip(page * limit)
      .limit(limit)
      .lean()
      .select("_id name totalQuestions exam date")
      .exec();

    const total = await Test.countDocuments({
      subject: { $in: [...genre] },
      name: { $regex: search, $options: "i" },
    });

    const totalpage = total / limit;
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
  }),
);
router.get(
  "/deleteTest/:id",
  passport.authenticate("adminJwt", { session: false }),
  asyncWrapper(async (req, res) => {
    const id = req.params.id;
    await Test.findByIdAndDelete(id);
    res.status(200).end();
  }),
);
router.get(
  "/deletePdf/:id",
  passport.authenticate("adminJwt", { session: false }),
  asyncWrapper(async (req, res) => {
    const id = req.params.id;
    await Pdf.findOneAndDelete({ url: id });
    const filePath = path.join(__dirname, "../files/pdf/", id);
    fs.unlink(filePath, function (err) {
      if (err) return console.log(err);
      res.status(200).end();
      return;
    });
    res.status(200).end();
  }),
);
router.get(
  "/pdf/:url",
  passport.authenticate("adminJwt", { session: false }),
  asyncWrapper(async (req, res) => {
    const fileUrl = req.params.url;
    const filePath = path.join(__dirname, "../files/pdf/", fileUrl);
    res.sendFile(filePath);
  }),
);
router.get(
  "/pdfs",
  passport.authenticate("adminJwt", { session: false }),
  asyncWrapper(async (req, res) => {
    const page = parseInt(req.query.page as string) - 1 || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search || "";
    const sort = parseInt(req.query.sort as string) || -1;
    let genre = [(req.query.subject as string) || "All"];
    const pageno = [1];
    const genreOptions = ["physics", "chemistry", "math", "biology"];

    if (genre[0] === "All") {
      genre = [...genreOptions];
    } else {
      genre = (req.query.subject as string).split(",");
    }

    const pdfs = await Pdf.find({ name: { $regex: search, $options: "i" } })
      .where("subject")
      .in([...genre])
      .sort({ date: sort as 1 | -1 })
      .skip(page * limit)
      .limit(limit)
      .select("name url");

    const total = await Pdf.countDocuments({
      subject: { $in: [...genre] },
      name: { $regex: search, $options: "i" },
    });

    const totalpage = total / limit;
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
  }),
);

router.get(
  "/dashboard",
  passport.authenticate("adminJwt", { session: false }),
  asyncWrapper(async (_req, res) => {
    const totalStudent = await Student.countDocuments();
    const jeePhysics = await JPhysicsQuestion.countDocuments();
    const jeeChemistry = await JChemistryQuestion.countDocuments();
    const jeeMath = await JMathQuestion.countDocuments();
    const numPhysics = await PhysicsNumQuestion.countDocuments();
    const numChemistry = await ChemistryNumQuestion.countDocuments();
    const numMath = await MathNumQuestion.countDocuments();
    const neetPhysics = await NPhysicsQuestion.countDocuments();
    const neetChemistry = await NChemistryQuestion.countDocuments();
    const neetBio = await NBiologyQuestion.countDocuments();
    const response = {
      totalStudent,
      jeePhysics,
      jeeChemistry,
      jeeMath,
      numPhysics,
      numChemistry,
      numMath,
      neetPhysics,
      neetChemistry,
      neetBio,
    };
    res.status(200).json(response);
  }),
);

router.get(
  "/studentList",
  passport.authenticate("adminJwt", { session: false }),
  asyncWrapper(async (req, res) => {
    const page = parseInt(req.query.page as string) - 1 || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search || "";
    const sort = parseInt(req.query.sort as string) || -1;
    const exam = req.query.exam || "Jee";
    const pageno = [1];
    let rankType = "topMarks";
    if (sort == 1) {
      rankType = "averageMarks";
    }
    const i = exam === "Neet" ? 1 : 0;

    const sortCriteria: { [key: string]: SortOrder } = {};
    sortCriteria[rankType + "." + i.toString] = -1;

    const students = await Student.find({
      name: { $regex: search, $options: "i" },
    })
      .sort(sortCriteria)
      .skip(page * limit)
      .limit(limit)
      .select("name prep topMarks averageMarks email profileImg phoneNumber");

    const total = await Student.countDocuments({
      name: { $regex: search, $options: "i" },
    });

    const totalpage = Math.ceil(total / limit);
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
      students,
      pageno,
    };

    res.status(200).json(response);
  }),
);
router.get(
  "/getResult",
  passport.authenticate("adminJwt", { session: false }),
  asyncWrapper(async (req, res) => {
    const studentId = req.query.studentId;
    const resultId = req.query.resultId;
    const student = await Student.findById(studentId)
      .select("results")
      .lean()
      .exec();
    if (!student) {
      throw new Error("Student not found.");
    }
    const results = student.results.filter((result) =>
      result._id.equals(resultId as string),
    );
    const test = await Test.findById(results[0].testId)
      .select("exam totalQuestions questionIds answers num")
      .lean()
      .exec();
    const data = { test: test, results: results[0] };
    res.send(data).status(200).end();
  }),
);
router.get(
  "/attemptList",
  passport.authenticate("adminJwt", { session: false }),
  asyncWrapper(async (req, res) => {
    const testId = req.query.testId;
    const page = parseInt(req.query.page as string) - 1 || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search || "";
    const sort = parseInt(req.query.sort as string) || -1;
    const pageno = [1];
    const students = await Student.find({
      name: { $regex: search, $options: "i" },
      results: {
        $elemMatch: { testId: testId },
      },
    })
      .skip(page * limit)
      .limit(limit)
      .select("_id name profileImg results");
    const filteredStudents: {
      _id: string;
      name: string;
      profileImg: string;
      results: IResult[];
    }[] = [];
    students.forEach((student) => {
      const filteredResults = student.results.filter(
        (result) => result.testId === testId,
      );
      if (filteredResults.length > 1) {
        filteredResults.forEach((result, index) => {
          if (index === 0) {
            const filteredStudent = {
              _id: student.id.toString() as string,
              name: student.name,
              profileImg: student.profileImg as string,
              results: [result],
            };
            filteredStudents.push(filteredStudent);
          } else {
            const clonedStudent = JSON.parse(JSON.stringify(student));
            clonedStudent.results = [result];
            filteredStudents.push(clonedStudent);
          }
        });
      } else if (filteredResults.length === 1) {
        filteredStudents.push({
          _id: student.id.toString(),
          name: student.name,
          profileImg: student.profileImg as string,
          results: filteredResults,
        });
      }
    });
    filteredStudents.sort((a, b) => {
      const studentAMarks = a.results[0].marks;
      const studentBMarks = b.results[0].marks;
      if (sort === 1) {
        return studentAMarks - studentBMarks;
      } else {
        return studentBMarks - studentAMarks;
      }
    });
    const total = await Student.countDocuments({
      name: { $regex: search, $options: "i" },
      results: {
        $elemMatch: { testId: testId },
      },
    });

    const totalpage = Math.ceil(total / limit);
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
      students: filteredStudents,
      pageno,
    };
    res.status(200).json(response);
  }),
);
router.get(
  "/getQuestion",
  passport.authenticate("adminJwt", { session: false }),
  asyncWrapper(async (req, res) => {
    const subject = req.query.subject as string;
    const id = req.query.id as string;
    const exam = req.query.exam as string;
    const Model = msubjectToModelMap[subject][exam];
    if (!Model) {
      throw new Error("Invalid subject or exam type.");
    }
    const question = await Model.findById(id)
      .select("questionText options img")
      .exec();
    res.send(question).end();
  }),
);
router.get(
  "/getnQuestion",
  passport.authenticate("adminJwt", { session: false }),
  asyncWrapper(async (req, res) => {
    const subject = req.query.subject as string;
    const id = req.query.id as string;
    const Model = nsubjectToModelMap[subject];
    if (!Model) {
      throw new Error("Invalid subject or exam type.");
    }
    const question = await Model.findById(id).select("questionText img").exec();
    res.send(question).end();
  }),
);

export default router;
