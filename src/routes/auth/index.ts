import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import asyncWrapper from "../../utils/asyncWrapper";
import { IStudent } from "../../models/student";
import { CustomError } from "../../utils/errorMiddleware";

const router = Router();

router.post(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  asyncWrapper(async (req, res) => {
    const user = req.user as IStudent;

    if (!user) {
      throw new CustomError("User not authorized", 403);
    }

    const newAccount = user.phoneNumber === undefined ? true : false;

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "10h",
    });

    res.redirect(
      `${process.env.REDIRECT_URL}?token=${token}&newAccount=${newAccount}`,
    );
  }),
);

router.post(
  "/admin/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    const user = req.user as { username: string };

    if (!user) {
      throw new CustomError("User not authorized", 403);
    }

    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_ADMIN_SECRET as string,
      { expiresIn: "10h" },
    );

    res.json({ adminToken: token });
  },
);

export default router;
