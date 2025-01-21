import express from "express";
import asyncWrapper from "../../../utils/asyncWrapper";
import { authenticateAdminJWT } from "../../../utils/admin";
import { uploadImg } from "../../../setup/multer";
import Question from "../../../models/question";

const router = express.Router();

router.post(
  "/",
  authenticateAdminJWT,
  uploadImg.single("img"),
  asyncWrapper(async (req, res) => {
    const { subject, exam, difficulty, questionText, correctOption, options } =
      req.body;
  }),
);

export default router;
