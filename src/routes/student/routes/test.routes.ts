import { Router } from "express";
import { authenticateJWT } from "../../../utils/student";
import asyncWrapper from "../../../utils/asyncWrapper";
import Test, { ITest } from "../../../models/test";
import { getPaginatedItems } from "../../../utils/paginationHelper";
import {
  JEEChemistryMCQ,
  JEEChemistryNumerical,
  JEEMathematicsMCQ,
  JEEMathematicsNumerical,
  JEEPhysicsMCQ,
  JEEPhysicsNumerical,
  NEETBiologyMCQ,
  NEETChemistryMCQ,
  NEETPhysicsMCQ,
} from "../../../models/question";
import z from "zod";
import { Types } from "mongoose";

const router = Router();

router.get("/", authenticateJWT, asyncWrapper(getPaginatedItems<ITest>(Test, 'name subject exam totalQuestions')));

const subjectToModelMap = {
  JEE: {
    physics: {
      mcq: JEEPhysicsMCQ,
      numerical: JEEPhysicsNumerical,
    },
    chemistry: {
      mcq: JEEChemistryMCQ,
      numerical: JEEChemistryNumerical,
    },
    math: {
      mcq: JEEMathematicsMCQ,
      numerical: JEEMathematicsNumerical,
    },
  },
  NEET: {
    physics: {
      mcq: NEETPhysicsMCQ,
    },
    chemistry: {
      mcq: NEETChemistryMCQ,
    },
    biology: {
      mcq: NEETBiologyMCQ,
    },
  },
};

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
  subject: z.enum(["JEE", "NEET"]),
  subjectType: z.enum(["physics", "chemistry", "math", "biology"]),
  type: z.enum(["mcq", "numerical"]),
});

router.get(
  "/question",
  authenticateJWT,
  asyncWrapper(async (req, res) => {
    const { id, subject, subjectType, type } = questionValidator.parse(
      req.query,
    );

    const subjectMap = subjectToModelMap[subject]?.[subjectType];
    if (!subjectMap) {
      return res.status(400).json({ error: "Invalid subject combination" });
    }

    const Model = subjectMap[type];
    if (!Model) {
      return res
        .status(400)
        .json({ error: "Invalid question type for this subject" });
    }

    const question = await Model.findById(id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json(question);
  }),
);

export default router;
