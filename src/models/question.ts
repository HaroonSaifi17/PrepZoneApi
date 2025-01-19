import mongoose, { Document, Schema } from "mongoose";

enum QuestionDifficulty {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
}

type ExamType = "JEE" | "NEET";
type Subject = "Mathematics" | "Physics" | "Chemistry" | "Biology";

interface BaseQuestion {
  difficulty: QuestionDifficulty;
  questionText: string;
  img?: string;
  correctOption: number;
  yearAppeared?: string;
}

interface MCQQuestion extends BaseQuestion {
  options: string[];
}

interface NumericalQuestion extends BaseQuestion {
  numericalAnswer: number;
  allowedError?: number;
}

interface IMCQQuestion extends MCQQuestion, Document {}
interface INumericalQuestion extends NumericalQuestion, Document {}

const baseQuestionFields = {
  difficulty: {
    type: String,
    enum: Object.values(QuestionDifficulty),
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    default: "",
  },
  correctOption: {
    type: Number,
    required: true,
  },
  yearAppeared: {
    type: String,
    required: false,
  },
};

const mcqSchema = new Schema({
  ...baseQuestionFields,
  options: {
    type: [String],
    required: true,
    validate: [
      {
        validator: (options: string[]) => options.length === 4,
        message: "MCQ questions must have exactly 4 options"
      }
    ]
  },
});

const numericalSchema = new Schema({
  ...baseQuestionFields,
  numericalAnswer: {
    type: Number,
    required: true,
  },
  allowedError: {
    type: Number,
    default: 0,
  },
});

const getModelName = (exam: ExamType, subject: Subject, type: "MCQ" | "Numerical") => 
  `${exam}_${subject}_${type}`;

const createModel = (exam: ExamType, subject: Subject, type: "MCQ" | "Numerical") => {
  const name = getModelName(exam, subject, type);
  const schema = type === "MCQ" ? mcqSchema : numericalSchema;
  return mongoose.model(name, schema);
};

export const JEEMathematicsMCQ = createModel("JEE", "Mathematics", "MCQ");
export const JEEPhysicsMCQ = createModel("JEE", "Physics", "MCQ");
export const JEEChemistryMCQ = createModel("JEE", "Chemistry", "MCQ");
export const NEETPhysicsMCQ = createModel("NEET", "Physics", "MCQ");
export const NEETChemistryMCQ = createModel("NEET", "Chemistry", "MCQ");
export const NEETBiologyMCQ = createModel("NEET", "Biology", "MCQ");
export const JEEMathematicsNumerical = createModel("JEE", "Mathematics", "Numerical");
export const JEEPhysicsNumerical = createModel("JEE", "Physics", "Numerical");
export const JEEChemistryNumerical = createModel("JEE", "Chemistry", "Numerical");

export type {
  QuestionDifficulty,
  ExamType,
  Subject,
  BaseQuestion,
  MCQQuestion,
  NumericalQuestion,
  IMCQQuestion,
  INumericalQuestion,
};
