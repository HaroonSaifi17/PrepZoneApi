import express, { Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import asyncWrapper from "../utils/asyncWrapper";
import { IStudent } from "../models/student";

const router = express.Router();

router.get(
  "/",
  passport.authenticate("google", {
    scope: ["email", "profile"],
    session: false,
  }),
);

router.get(
  "/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  asyncWrapper(async (req, res) => {
    const user = req.user as IStudent;
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "10h" },
    );

    res.redirect(`${process.env.REDIRECT_URL}?token=${token}`);
  }),
);

router.post(
  "/admin",
  passport.authenticate("local", { session: false }),
  (req: Request, res: Response) => {
    const user = req.user as { username: string };

    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_ADMIN_SECRET as string,
      { expiresIn: "10h" },
    );

    res.send({ adminToken: token }).end();
  },
);

export default router;
