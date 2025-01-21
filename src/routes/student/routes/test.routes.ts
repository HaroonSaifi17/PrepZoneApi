import { Router } from "express";
import { authenticateJWT } from "../../../utils/student";
import asyncWrapper from "../../../utils/asyncWrapper";
import Test, { ITest } from "../../../models/test";
import { getPaginatedItems } from "../../../utils/paginationHelper";
import Question from "../../../models/question";
import z from "zod";
import { Types } from "mongoose";
import { authenticateAnyRole } from "../../../utils/auth";
import passport from "passport";
import { CustomError } from "../../../utils/errorMiddleware";

const router = Router();

router.get(
  "/",
  authenticateAnyRole(
    passport.authenticate("adminJwt", { session: false }),
    passport.authenticate("jwt", { session: false }),
  ),
  asyncWrapper(
    getPaginatedItems<ITest>(Test, "name subject exam totalQuestions"),
  ),
);
router.get(
  "/:id",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const validator = z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid ObjectId format",
    });
    const id = validator.parse(req.params.id);
    const question = await Test.findById(id);
    res.json(question);
  }),
);

const questionValidator = z.object({
  id: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
  }),
  exam: z.enum(["JEE", "NEET"]),
  subject: z.enum(["physics", "chemistry", "math", "biology"]),
  type: z.enum(["mcq", "numerical"]),
});

router.get(
  "/question",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const { id, subject, exam, type } = questionValidator.parse(req.query);

    if (
      (exam === "NEET" && type !== "mcq") ||
      (exam === "JEE" && subject === "biology") ||
      (exam === "NEET" && type === "numerical")
    ) {
      throw new CustomError("Invalid question type", 400);
    }
    const question = await Question.findById(id);

    if (!question) {
      throw new CustomError("Question not found", 404);
    }
    res.json(question);
  }),
);

export default router;
