import mongoose, { Document, Schema } from "mongoose";

enum Difficulty {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
}

export interface IQuestion extends Document {
  difficulty: Difficulty;
  questionText: string;
  options: string[];
  img?: string;
  correctOption: number;
}

export interface INumericalQuestion extends Document {
  difficulty: Difficulty;
  questionText: string;
  img?: string;
  correctOption: number;
}

const questionSchema = new Schema<IQuestion>({
  difficulty: {
    type: String,
    enum: Object.values(Difficulty),
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
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
});

const numericalSchema = new Schema<INumericalQuestion>({
  difficulty: {
    type: String,
    enum: Object.values(Difficulty),
    required: true,
  },
  img: {
    type: String,
    default: "",
  },
  questionText: {
    type: String,
    required: true,
  },
  correctOption: {
    type: Number,
    required: true,
  },
});

const JMathQuestion = mongoose.model<IQuestion>(
  "JMathQuestion",
  questionSchema,
);
const JPhysicsQuestion = mongoose.model<IQuestion>(
  "JPhysicsQuestion",
  questionSchema,
);
const JChemistryQuestion = mongoose.model<IQuestion>(
  "JChemistryQuestion",
  questionSchema,
);
const NBiologyQuestion = mongoose.model<IQuestion>(
  "NBiologyQuestion",
  questionSchema,
);
const NPhysicsQuestion = mongoose.model<IQuestion>(
  "NPhysicsQuestion",
  questionSchema,
);
const NChemistryQuestion = mongoose.model<IQuestion>(
  "NChemistryQuestion",
  questionSchema,
);
const MathNumQuestion = mongoose.model<INumericalQuestion>(
  "MathNumQuestion",
  numericalSchema,
);
const PhysicsNumQuestion = mongoose.model<INumericalQuestion>(
  "PhysicsNumQuestion",
  numericalSchema,
);
const ChemistryNumQuestion = mongoose.model<INumericalQuestion>(
  "ChemistryNumQuestion",
  numericalSchema,
);

export {
  JMathQuestion,
  JPhysicsQuestion,
  JChemistryQuestion,
  NBiologyQuestion,
  NPhysicsQuestion,
  NChemistryQuestion,
  MathNumQuestion,
  PhysicsNumQuestion,
  ChemistryNumQuestion,
};
