import { Router, Request, Response } from "express";
import path from "path";
import passport from "passport";
import Student, { IStudent } from "../models/student";
import Test from "../models/test";
import asyncWrapper from "../utils/asyncWrapper";
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
  IQuestion,
  INumericalQuestion,
} from "../models/question";
import { JwtPayload } from "jsonwebtoken";
import mongoose, { Model } from "mongoose";

const router = Router();
const authenticateJWT = passport.authenticate("jwt", { session: false });

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

async function getStudentDataById(
  userId: string,
  fields: string,
): Promise<IStudent> {
  try {
    const data = (await Student.findById(userId)
      .select(fields)
      .exec()) as IStudent;
    if (data) return data;
    throw new Error("Data not found");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Unknown error");
  }
}

router.get(
  "/getImg/:url",
  asyncWrapper(async (req: Request, res: Response) => {
    const filePath = path.join(
      __dirname,
      "../files/questionImages/",
      req.params.url,
    );
    res.sendFile(filePath);
  }),
);

router.get(
  "/profileImg",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const user = req.user as JwtPayload;
    const data = await getStudentDataById(user.id, "profileImg name");
    res.send(data);
  }),
);

router.get(
  "/profileData",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const user = req.user as JwtPayload;
    const data = await getStudentDataById(
      user.id,
      "profileImg name email phoneNumber prep",
    );
    res.send(data);
  }),
);

router.post(
  "/newStudentPost",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const user = req.user as JwtPayload;
    const data = await getStudentDataById(user.id, "name phoneNumber prep");
    data.name = req.body.name;
    data.phoneNumber = req.body.phoneNumber;
    data.prep = req.body.prep;
    await data.save();
    res.status(200).end();
  }),
);

router.get(
  "/checkNew",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const user = req.user as JwtPayload;
    const data = await getStudentDataById(user.id, "phoneNumber name");
    res.send({
      isNew: typeof data.phoneNumber === "undefined",
      name: data.name,
    });
  }),
);

router.get(
  "/jeeData",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const user = req.user as JwtPayload;
    const data = await getStudentDataById(
      user.id,
      "name topMarks averageMarks physicsAccuracy chemistryAccuracy mathAccuracy mathTime chemistryTime physicsTime",
    );
    res.json({
      name: data.name,
      topMarks: data.topMarks[0],
      averageMarks: data.averageMarks[0],
      physicsAccuracy: data.physicsAccuracy[0],
      chemistryAccuracy: data.chemistryAccuracy[0],
      mathAccuracy: data.mathAccuracy,
      mathTime: data.mathTime,
      chemistryTime: data.chemistryTime[0],
      physicsTime: data.physicsTime[0],
    });
  }),
);

router.get(
  "/neetData",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const user = req.user as JwtPayload;
    const data = await getStudentDataById(
      user.id,
      "name topMarks averageMarks physicsAccuracy chemistryAccuracy bioAccuracy bioTime chemistryTime physicsTime",
    );
    res.json({
      name: data.name,
      topMarks: data.topMarks[1],
      averageMarks: data.averageMarks[1],
      physicsAccuracy: data.physicsAccuracy[1],
      chemistryAccuracy: data.chemistryAccuracy[1],
      bioAccuracy: data.bioAccuracy,
      bioTime: data.bioTime,
      chemistryTime: data.chemistryTime[1],
      physicsTime: data.physicsTime[1],
    });
  }),
);

router.get(
  "/getTests",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const page = parseInt(req.query.page as string) - 1 || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const sort = parseInt(req.query.sort as string) || -1;
    let genre = [(req.query.subject as string) || "All"];
    const pageno = [1];
    const genreOptions = ["physics", "chemistry", "math", "bio"];

    genre =
      genre[0] === "All"
        ? genreOptions
        : (req.query.subject as string).split(",");

    const tests = await Test.find({ name: { $regex: search, $options: "i" } })
      .where("subject")
      .in([...genre])
      .sort({ date: sort as 1 | -1 })
      .skip(page * limit)
      .limit(limit)
      .lean()
      .select("_id name totalQuestions exam date");

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

    res.status(200).json({
      error: false,
      total,
      page: page + 1,
      limit,
      tests,
      pageno,
    });
  }),
);

router.get(
  "/getTest/:id",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const question = await Test.findById(req.params.id);
    res.send(question);
  }),
);

router.get(
  "/getQuestion",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const { subject, exam, id } = req.query as {
      subject: string;
      exam: string;
      id: string;
    };
    const Model = msubjectToModelMap[subject][exam];
    if (!Model) throw new Error("Invalid subject or exam type.");

    const question = await Model.findById(id).select(
      "questionText options img",
    );
    res.send(question);
  }),
);

router.get(
  "/getnQuestion",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const { subject, id } = req.query as { subject: string; id: string };
    const Model = nsubjectToModelMap[subject];
    if (!Model) throw new Error("Invalid subject or exam type.");

    const question = await Model.findById(id).select("questionText img");
    res.send(question);
  }),
);

router.post(
  "/result",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const user = req.user as JwtPayload;
    const student = await Student.findById(user.id);
    const { choosenOption, testId, time } = req.body;
    const test = await Test.findById(testId).select(
      "subject exam totalQuestions questionIds num name answers",
    );
    if (!test) throw new Error("Test not found");
    if (!student) throw new Error("Student not found");

    const correct = [0];
    const wrong = [0];
    let index = 0;

    if (test.subject.length == 3) {
      correct.push(0);
      correct.push(0);
      wrong.push(0);
      wrong.push(0);
    }

    for (let i = 0; i < test.totalQuestions; i++) {
      if (test.subject.length == 3) {
        if (i < test.totalQuestions / 3) index = 0;
        else if (i < test.totalQuestions / 1.5) index = 1;
        else index = 2;
      }

      if (choosenOption[i] == test.answers[i]) correct[index]++;
      else if (choosenOption[i] !== 999) wrong[index]++;
    }

    let marks = 0;
    if (test.subject.length == 3) {
      marks =
        (correct[0] + correct[1] + correct[2]) * 4 -
        (wrong[0] + wrong[1] + wrong[2]);
      if (test.exam == "jee") {
        if (correct[0] + wrong[0] !== 0) {
          const mathAcc = (correct[0] / (correct[0] + wrong[0])) * 100;
          student.mathAccuracy =
            student.mathAccuracy === 0
              ? mathAcc
              : (student.mathAccuracy + mathAcc) / 2;

          const physAcc = (correct[1] / (correct[1] + wrong[1])) * 100;
          student.physicsAccuracy[0] =
            student.physicsAccuracy[0] === 0
              ? physAcc
              : (student.physicsAccuracy[0] + physAcc) / 2;

          const chemAcc = (correct[2] / (correct[2] + wrong[2])) * 100;
          student.chemistryAccuracy[0] =
            student.chemistryAccuracy[0] === 0
              ? chemAcc
              : (student.chemistryAccuracy[0] + chemAcc) / 2;
        }

        student.mathTime += time / test.totalQuestions;
        student.physicsTime[0] += time / test.totalQuestions;
        student.chemistryTime[0] += time / test.totalQuestions;

        if (marks > student.topMarks[0]) student.topMarks[0] = marks;
        student.averageMarks[0] += marks;
      } else {
        if (correct[0] + wrong[0] !== 0) {
          const bioAcc = (correct[0] / (correct[0] + wrong[0])) * 100;
          student.bioAccuracy =
            student.bioAccuracy === 0
              ? bioAcc
              : (student.bioAccuracy + bioAcc) / 2;

          const physAcc = (correct[1] / (correct[1] + wrong[1])) * 100;
          student.physicsAccuracy[1] =
            student.physicsAccuracy[1] === 0
              ? physAcc
              : (student.physicsAccuracy[1] + physAcc) / 2;

          const chemAcc = (correct[2] / (correct[2] + wrong[2])) * 100;
          student.chemistryAccuracy[1] =
            student.chemistryAccuracy[1] === 0
              ? chemAcc
              : (student.chemistryAccuracy[1] + chemAcc) / 2;
        }

        student.bioTime += time / test.totalQuestions;
        student.physicsTime[1] += time / test.totalQuestions;
        student.chemistryTime[1] += time / test.totalQuestions;

        if (marks > student.topMarks[1]) student.topMarks[1] = marks;
        student.averageMarks[1] += marks;
      }
    } else {
      const index2 = test.exam == "jee" ? 0 : 1;
      marks = correct[0] * 4 - wrong[0];

      if (test.subject[0] === "math" && correct[0] + wrong[0] !== 0) {
        const mathAcc = (correct[0] / (correct[0] + wrong[0])) * 100;
        student.mathAccuracy =
          student.mathAccuracy === 0
            ? mathAcc
            : (student.mathAccuracy + mathAcc) / 2;
        student.mathTime += time / test.totalQuestions;
      } else if (test.subject[0] === "physics" && correct[0] + wrong[0] !== 0) {
        const physAcc = (correct[0] / (correct[0] + wrong[0])) * 100;
        student.physicsAccuracy[index2] =
          student.physicsAccuracy[index2] === 0
            ? physAcc
            : (student.physicsAccuracy[index2] + physAcc) / 2;
        student.physicsTime[index2] += time / test.totalQuestions;
      } else if (
        test.subject[0] === "chemistry" &&
        correct[0] + wrong[0] !== 0
      ) {
        const chemAcc = (correct[0] / (correct[0] + wrong[0])) * 100;
        student.chemistryAccuracy[index2] =
          student.chemistryAccuracy[index2] === 0
            ? chemAcc
            : (student.chemistryAccuracy[index2] + chemAcc) / 2;
        student.chemistryTime[index2] += time / test.totalQuestions;
      } else if (test.subject[0] === "bio" && correct[0] + wrong[0] !== 0) {
        const bioAcc = (correct[0] / (correct[0] + wrong[0])) * 100;
        student.bioAccuracy =
          student.bioAccuracy === 0
            ? bioAcc
            : (student.bioAccuracy + bioAcc) / 2;
        student.bioTime += time / test.totalQuestions;
      }
    }

    student.results.push({
      _id: new mongoose.Types.ObjectId(),
      result: choosenOption,
      testId: testId,
      date: new Date().toLocaleString(),
      time: time,
      correct: correct,
      wrong: wrong,
      marks: marks,
      subject: test.subject,
      name: test.name,
    });

    await student.save();
    res
      .send({
        _id: student.results[student.results.length - 1].testId.toString(),
      })
      .status(200);
  }),
);

router.get(
  "/getResultList",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const page = parseInt(req.query.page as string) - 1 || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const sort = parseInt(req.query.sort as string) || -1;
    let genre: string[] = [(req.query.subject as string) || "All"];
    const pageno = [1];
    const genreOptions = ["physics", "chemistry", "math", "bio"];
    const user = req.user as JwtPayload;

    if (genre[0] === "All") {
      genre = genreOptions;
    } else {
      genre = (req.query.subject as string).split(",");
    }
    const student = await Student.findById(user.id)
      .select("results")
      .lean()
      .exec();
    if (!student) throw new Error("Student not found");
    const results = student.results
      .filter(
        (result) =>
          result.name.match(new RegExp(search, "i")) &&
          result.subject.some((subject) => genre.includes(subject)),
      )
      .sort((a, b) => {
        return (new Date(b.date).getTime() - new Date(a.date).getTime()) * sort;
      })
      .slice(page * limit, (page + 1) * limit)
      .map(({ testId, name, date, marks }) => ({
        _id: testId,
        name,
        date,
        marks,
      }));

    const total = results.length;
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
      results,
      pageno,
    };
    res.status(200).json(response);
  }),
);

router.get(
  "/getResult/:id",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const user = req.user as JwtPayload;
    const student = await Student.findById(user.id)
      .select("results")
      .lean()
      .exec();
    if (!student) throw new Error("Student not found");
    const results = student.results.filter(
      (result) => result.testId == req.params.id,
    );
    const test = await Test.findById(results[0].testId)
      .select("exam totalQuestions questionIds answers num")
      .lean()
      .exec();
    const data = { test: test, results: results[0] };
    res.send(data).status(200).end();
  }),
);

export default router;
