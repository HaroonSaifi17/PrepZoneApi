import { Router } from "express";
import { getStudentDataById, isUser ,authenticateJWT} from "./../../../utils/student";
import { JwtPayload } from "jsonwebtoken";
import asyncWrapper from "../../../utils/asyncWrapper";
import z from "zod";

const router = Router();


router.get(
  "/:exam",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const user = req.user as JwtPayload;
    isUser(user);
    const data = await getStudentDataById(
      user.id,
      "examMatrics",
    );
    const validator = z.enum(["JEE", "NEET"]);
    const exam = validator.parse(req.params.exam);

    res.send(data.examMetrics[exam]).status(200);
  }),
);

export default router;
