import { Router } from "express";
import path from "path";
import {
  getStudentDataById,
  isUser,
  authenticateJWT,
} from "./../../../utils/student";
import { JwtPayload } from "jsonwebtoken";
import { z } from "zod";
import asyncWrapper from "../../../utils/asyncWrapper";

const router = Router();

router.get(
  "/image/:url",
  asyncWrapper(async (req, res) => {
    const filePath = path.join(
      __dirname,
      "../files/questionImages/",
      req.params.url,
    );
    res.sendFile(filePath);
  }),
);

router.get(
  "/avatar",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const user = req.user as JwtPayload;
    isUser(user);
    const data = await getStudentDataById(user.id, "profileImg name");
    res.json(data);
  }),
);

router.get(
  "/details",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const user = req.user as JwtPayload;
    isUser(user);
    const data = await getStudentDataById(
      user.id,
      "profileImg name email phoneNumber examType",
    );
    res.json(data);
  }),
);

router.post(
  "/update",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const user = req.user as JwtPayload;
    isUser(user);
    const data = await getStudentDataById(user.id, "name phoneNumber examType");
    const bodySchema = z.object({
      name: z.string(),
      phoneNumber: z.number(),
      examType: z.enum(["JEE", "NEET"]),
    });

    const validatedData = bodySchema.parse(req.body);

    data.name = validatedData.name;
    data.phoneNumber = validatedData.phoneNumber;
    data.examType = validatedData.examType;
    await data.save();
    res.json({ message: "Update successful", data });
  }),
);

export default router;
