import mongoose, { Schema } from "mongoose";

enum QuestionDifficulty {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
}

type ExamType = "JEE" | "NEET";
type Subject = "Mathematics" | "Physics" | "Chemistry" | "Biology";

interface IQuestion {
  difficulty: QuestionDifficulty;
  questionText: string;
  img?: string;
  correctAnswer?: number;
  options?: string[];
  subject: Subject;
  exam: ExamType;
  type: "mcq" | "numerical";
  yearAppeared?: string;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
    },
    questionText: { type: String, required: true },
    img: { type: String },
    correctAnswer: { type: Number },
    options: { type: [String] },
    subject: {
      type: String,
      required: true,
      enum: ["Mathematics", "Physics", "Chemistry", "Biology"],
    },
    exam: { type: String, required: true, enum: ["JEE", "NEET"] },
    type: { type: String, required: true, enum: ["mcq", "numerical"] },
    yearAppeared: { type: String },
  },
  { timestamps: true },
);
const Question = mongoose.model<IQuestion>("questions", QuestionSchema);
export default Question;
