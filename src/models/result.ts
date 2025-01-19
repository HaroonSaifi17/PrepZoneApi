import mongoose, { Document, Schema } from "mongoose";

export interface IResult extends Document {
  testId: string;
  name: string;
  subjectWiseAnalysis: {
    correct: number;
    wrong: number;
    score: number;
  }[];
  chosenOptions: number[];
  correctOptions: number[];
  examType: "JEE" | "NEET";
  subject: "physics" | "chemistry" | "mathematics" | "biology" | "all";
  totalTime: number;
  totalMarks: number;
}

const ResultSchema = new Schema<IResult>(
  {
    testId: { type: String, required: true },
    name: { type: String, required: true },
    subjectWiseAnalysis: [
      {
        correct: { type: Number, required: true },
        wrong: { type: Number, required: true },
        score: { type: Number, required: true },
      },
    ],
    chosenOptions: { type: [Number], required: true },
    correctOptions: { type: [Number], required: true },
    examType: {
      type: String,
      Enum: ["JEE", "NEET"],
      required: true,
    },
    subject: {
      type: String,
      Enum: ["physics", "chemistry", "mathematics", "biology", "all"],
      required: true,
    },
    totalTime: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
  },
  { timestamps: true },
);

const Result = mongoose.model<IResult>("results", ResultSchema);

export default Result;
