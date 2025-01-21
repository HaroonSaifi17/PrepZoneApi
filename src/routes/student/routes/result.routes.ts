import { Router } from "express";
import { authenticateJWT, isUser } from "../../../utils/student";
import asyncWrapper from "../../../utils/asyncWrapper";
import Result, { IResult } from "../../../models/result";
import { getPaginatedItems } from "../../../utils/paginationHelper";
import { Types, Schema } from "mongoose";
import z from "zod";
import { JwtPayload } from "jsonwebtoken";
import Test from "../../../models/test";
import { getStudentDataById } from "../../../utils/student";

const router = Router();

router.get(
  "/",
  authenticateJWT,
  asyncWrapper(
    getPaginatedItems<IResult>(
      Result,
      "testId subject exam totalQuestions name",
    ),
  ),
);

router.get(
  "/:id",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const validation = z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid ObjectId format",
    });
    const id = validation.parse(req.params.id);
    const result = await Result.findById(id);
    res.json(result);
  }),
);

router.post(
  "/",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const user = req.user as JwtPayload;
    isUser(user);
    const validation = z.object({
      testId: z.string().refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid ObjectId format",
      }),
      choosenOptions: z.array(z.number().nullable()),
      timeTaken: z.number(),
    });
    const { testId, choosenOptions, timeTaken } = validation.parse(req.body);
    const test = await Test.findById(testId);
    if (!test) {
      throw new Error("Test not found");
    }
    let loop = 1;
    if (test.subject === "all") {
      loop = 3;
    }
    const subjecWiseAnalysis: {
      correct: number;
      wrong: number;
      score: number;
    }[] = [];
    let totalScore = 0;

    for (let j = 1; j <= loop; j++) {
      let score = 0;
      let correct = 0;
      let wrong = 0;
      for (
        let i = (test.totalQuestions / loop) * j - test.totalQuestions / loop;
        i < (test.totalQuestions / loop) * j;
        i++
      ) {
        if (choosenOptions[i] === null) {
          continue;
        }
        if (choosenOptions[i] === test.correctOptions[i]) {
          correct += 1;
        } else {
          wrong += 1;
        }
      }
      score = correct * 4 - wrong;
      totalScore += score;
      subjecWiseAnalysis.push({ correct, wrong, score });
    }

    const result = await Result.create({
      testId,
      subject: test.subject,
      exam: test.exam,
      name: test.name,
      choosenOptions,
      correctOptions: test.correctOptions,
      timeTaken,
      subjecWiseAnalysis,
      totalScore,
    });

    const student = await getStudentDataById(user.id, "examMatrics results");
    student.results.push(result._id as Schema.Types.ObjectId);
    student.examMetrics[result.exam].averageScore =
      (student.examMetrics[result.exam].averageScore * student.results.length +
        totalScore) /
      (student.results.length + 1);
    student.examMetrics[result.exam].topScore = Math.max(
      student.examMetrics[result.exam].topScore,
      totalScore,
    );
    student.examMetrics[result.exam].physics.accuracy =
      (student.examMetrics[result.exam].physics.accuracy *
        student.results.length +
        subjecWiseAnalysis[0].correct) /
      (student.results.length + 1);
    student.examMetrics[result.exam].physics.timeSpent =
      (student.examMetrics[result.exam].physics.timeSpent *
        student.results.length +
        timeTaken) /
      (student.results.length + 1);
    student.examMetrics[result.exam].chemistry.accuracy =
      (student.examMetrics[result.exam].chemistry.accuracy *
        student.results.length +
        subjecWiseAnalysis[1].correct) /
      (student.results.length + 1);
    student.examMetrics[result.exam].chemistry.timeSpent =
      (student.examMetrics[result.exam].chemistry.timeSpent *
        student.results.length +
        timeTaken) /
      (student.results.length + 1);
    student.examMetrics["JEE"].mathematics.accuracy =
      (student.examMetrics["JEE"].mathematics.accuracy *
        student.results.length +
        subjecWiseAnalysis[2].correct) /
      (student.results.length + 1);
    if (test.exam === "JEE") {
      student.examMetrics["JEE"].mathematics.timeSpent =
        (student.examMetrics["JEE"].mathematics.timeSpent *
          student.results.length +
          timeTaken) /
        (student.results.length + 1);
    } else {
      student.examMetrics["NEET"].biology.accuracy =
        (student.examMetrics["NEET"].biology.accuracy * student.results.length +
          subjecWiseAnalysis[2].correct) /
        (student.results.length + 1);
    }
    await student.save();

    res.json({
      success: true,
      message: "Result saved successfully",
      id: result._id,
    });
  }),
);

export default router;
