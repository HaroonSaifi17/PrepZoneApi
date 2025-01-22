import express from "express";
import path from "path";
import Pdf, { IPdf } from "../../../models/pdf";
import asyncWrapper from "../../../utils/asyncWrapper";
import { uploadPdf } from "../../../setup/multer";
import { CustomError } from "../../../utils/errorMiddleware";
import { authenticateAnyRole } from "../../../utils/auth";
import { getPaginatedItems } from "../../../utils/paginationHelper";
import { authenticateAdminJWT } from "../../../utils/admin";
import { authenticateJWT } from "../../../utils/student";
import z from "zod";

const router = express.Router();

router.post(
  "/",
  authenticateAdminJWT,
  uploadPdf.single("pdf"),
  asyncWrapper(async (req, res) => {
    if (!req.file) {
      throw new CustomError("file not found", 400);
    }
    const validator = z.object({
      name: z.string(),
      subject: z.enum(["physics", "chemistry", "math", "biology"]),
    });
    const { name, subject } = validator.parse(req.body);
    const pdf = new Pdf({
      name,
      subject,
      url: req.file.filename,
    });

    await pdf.save();

    res.json({
      success: true,
      message: "Uploaded",
    });
  }),
);

router.get(
  "/:url",
  authenticateAnyRole(
    authenticateAdminJWT,
    authenticateJWT,
  ),
  asyncWrapper(async (req, res) => {
    const fileUrl = z.string().parse(req.params.url);
    const filePath = path.join(__dirname, "../../../files/pdf/", fileUrl);
    res.sendFile(filePath);
  }),
);

router.get(
  "/",
  authenticateAnyRole(
    authenticateAdminJWT,
    authenticateJWT,
  ),
  getPaginatedItems<IPdf>(Pdf, "name url subject"),
);

router.delete(
  "/:id",
  authenticateAdminJWT,
  asyncWrapper(async (req, res) => {
    const id = z.string().parse(req.params.id);
    await Pdf.findByIdAndDelete(id);
    res.json({
      success: true,
      message: "Deleted",
    });
  }),
);

export default router;
