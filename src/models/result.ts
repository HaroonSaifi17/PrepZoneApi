import mongoose, { Document, Schema } from "mongoose";

export interface IResult extends Document {
  testId: string;
  name: string;
  subjectWiseAnalysis: {
    correct: number;
    wrong: number;
    score: number;
  }[];
  chosenOptions: (number | null)[];
  correctOptions: number[];
  exam: "JEE" | "NEET";
  subject: "physics" | "chemistry" | "mathematics" | "biology" | "all";
  timeTaken: number;
  totalScore: number;
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
    exam: {
      type: String,
      Enum: ["JEE", "NEET"],
      required: true,
    },
    subject: {
      type: String,
      Enum: ["physics", "chemistry", "mathematics", "biology", "all"],
      required: true,
    },
    totalScore: { type: Number, required: true },
    timeTaken: { type: Number, required: true },
  },
  { timestamps: true },
);

const Result = mongoose.model<IResult>("results", ResultSchema);

export default Result;
