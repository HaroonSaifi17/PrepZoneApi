import { JwtPayload } from "jsonwebtoken";
import Student from "../models/student";
import passport from "passport";
import { CustomError } from "./errorMiddleware";
import { z } from "zod";
import { Types } from "mongoose";

export const getStudentDataById = async (id: string, fields: string) => {
  const student = await Student.findById(id).select(fields);
  if (!student) {
    throw new Error("Student not found");
  }
  return student;
};

export function isUser(user: JwtPayload) {
  if (!user) {
    throw new CustomError("User not authorized", 403);
  }
  z.object({
    id: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: "Invalid ObjectId format",
    }),
    email: z.string(),
  }).parse(user);
}

export const authenticateJWT = passport.authenticate("jwt", { session: false });
