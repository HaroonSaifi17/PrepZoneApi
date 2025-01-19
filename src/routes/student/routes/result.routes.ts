import { Router } from "express";
import { authenticateJWT, isUser } from "../../../utils/student";
import asyncWrapper from "../../../utils/asyncWrapper";
import Result, { IResult } from "../../../models/result";
import { getPaginatedItems } from "../../../utils/paginationHelper";
import { Types } from "mongoose";
import z from "zod";
import { JwtPayload } from "jsonwebtoken";
import Test from "../../../models/test";

const router = Router();

router.get(
  "/",
  authenticateJWT,
  asyncWrapper(getPaginatedItems<IResult>(Result, "testId subject exam totalQuestions name")),
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
      choosenOptions: z.array(z.number()),
      timeTaken: z.number(),
    });
    const { testId, choosenOptions, timeTaken } = validation.parse(req.body);
    const test = await Test.findById(testId);
    if (!test) {
      throw new Error("Test not found");
    }
    // TODO: main logic
  }),
);

export default router;
