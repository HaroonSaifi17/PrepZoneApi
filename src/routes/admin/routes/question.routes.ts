import express from "express";
import asyncWrapper from "../../../utils/asyncWrapper";
import { authenticateAdminJWT } from "../../../utils/admin";
import { uploadImg } from "../../../setup/multer";
import Question from "../../../models/question";
import z from "zod";

const router = express.Router();

router.post(
  "/",
  authenticateAdminJWT,
  uploadImg.single("img"),
  asyncWrapper(async (req, res) => {
    const validator = z.object({
      questionText: z.string(),
      correctAnswer: z.number().optional(),
      options: z.array(z.string()).optional(),
      subject: z.enum(["Mathematics", "Physics", "Chemistry", "Biology"]),
      exam: z.enum(["JEE", "NEET"]),
      type: z.enum(["mcq", "numerical"]),
      yearAppeared: z.string().optional(),
    });

    const {
      questionText,
      correctAnswer,
      options,
      subject,
      exam,
      type,
      yearAppeared,
    } = validator.parse(req.body);
    const img = req.file ? req.file.filename : undefined;

    await Question.create({
      questionText,
      img,
      correctAnswer,
      options,
      subject,
      exam,
      type,
      yearAppeared,
    });

    res.json({
      success: true,
      message: "Question created successfully",
    });
  }),
);

export default router;
