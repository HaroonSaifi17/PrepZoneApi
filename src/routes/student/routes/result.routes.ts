import { Router } from "express";
import { authenticateJWT, isUser } from "../../../utils/student";
import asyncWrapper from "../../../utils/asyncWrapper";
import Result from "../../../models/result";
import { Types, Schema } from "mongoose";
import z from "zod";
import { JwtPayload } from "jsonwebtoken";
import Test from "../../../models/test";
import { getStudentDataById } from "../../../utils/student";
import { authenticateAnyRole } from "../../../utils/auth";
import { authenticateAdminJWT } from "../../../utils/admin";
import Student from "../../../models/student";
import {
  QuerySchema,
} from "../../../utils/paginationHelper";

const router = Router();

router.get("/", authenticateAnyRole(authenticateJWT, authenticateAdminJWT), asyncWrapper(async (req, res) => {
  const user = req.query.id ? { id: req.query.id } : req.user as JwtPayload;
  const id = z.string().refine(val => Types.ObjectId.isValid(val), { message: "Invalid ObjectId format" }).parse(user.id);
  
  const resultIds = await Student.findById(id).select("results");
  if (!resultIds) throw new Error("Result IDs not found");

  const { page, limit, searchTerm, subject, sortBy, sortOrder } = QuerySchema.parse(req.query);
  
  const filterCriteria = {
    ...(searchTerm && { name: { $regex: searchTerm, $options: "i" } }),
    ...(subject && subject !== "all" && { 
      subject,
      _id: { $in: resultIds.results }
    })
  };

  const [items, totalItems] = await Promise.all([
    Result.find(filterCriteria)
      .select("name subject exam totalScore testId")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Result.countDocuments(filterCriteria)
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return res.json({
    success: true,
    data: {
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: { subject, searchTerm },
      sorting: { sortBy, sortOrder }
    }
  });
}));

router.get(
  "/:id",
  authenticateAnyRole(authenticateJWT, authenticateAdminJWT),
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
      timeTaken: z.array(z.number()),
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
      accuracy: number;
      timeTaken: number;
    }[] = [];

    for (let j = 1; j <= loop; j++) {
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
      subjecWiseAnalysis.push({
        correct,
        wrong,
        score: correct * 4,
        accuracy: (correct / (correct + wrong)) * 100,
        timeTaken: timeTaken[j - 1],
      });
    }

    const {
      correct,
      wrong,
      score,
      accuracy,
      timeTaken: timeTaken1,
    } = subjecWiseAnalysis.reduce(
      (acc, curr) => {
        acc.correct += curr.correct;
        acc.wrong += curr.wrong;
        acc.score += curr.score;
        acc.accuracy += curr.accuracy;
        acc.timeTaken += curr.timeTaken;
        return acc;
      },
      { correct: 0, wrong: 0, score: 0, accuracy: 0, timeTaken: 0 },
    );

    const result = await Result.create({
      testId,
      subject: test.subject,
      exam: test.exam,
      name: test.name,
      choosenOptions,
      correctOptions: test.correctOptions,
      subjecWiseAnalysis,
      correct,
      wrong,
      totalScore: score,
      accuracy: accuracy / loop,
      timeTaken: timeTaken1,
    });

    const student = await getStudentDataById(user.id, "examMatrics results");
    student.results.push(result._id as Schema.Types.ObjectId);

    student.examMetrics[result.exam].averageScore =
      (student.examMetrics[result.exam].averageScore * student.results.length +
        result.totalScore) /
      (student.results.length + 1);
    student.examMetrics[result.exam].topScore = Math.max(
      student.examMetrics[result.exam].topScore,
      result.totalScore,
    );

    student.examMetrics[result.exam].physics.accuracy =
      (student.examMetrics[result.exam].physics.accuracy *
        student.results.length +
        subjecWiseAnalysis[0].correct) /
      (student.results.length + 1);
    student.examMetrics[result.exam].physics.timeSpent =
      (student.examMetrics[result.exam].physics.timeSpent *
        student.results.length +
        result.timeTaken) /
      (student.results.length + 1);

    student.examMetrics[result.exam].chemistry.accuracy =
      (student.examMetrics[result.exam].chemistry.accuracy *
        student.results.length +
        subjecWiseAnalysis[1].correct) /
      (student.results.length + 1);
    student.examMetrics[result.exam].chemistry.timeSpent =
      (student.examMetrics[result.exam].chemistry.timeSpent *
        student.results.length +
        result.timeTaken) /
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
          result.timeTaken) /
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
