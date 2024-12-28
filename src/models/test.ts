import mongoose, { Document, Schema } from "mongoose";

interface ITest extends Document {
  name: string;
  subject: string[];
  exam: string;
  totalQuestions: number;
  date: string;
  num: number;
  answers: number[];
  questionIds: string[];
}

const testSchema = new Schema<ITest>({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: [String],
    required: true,
  },
  exam: {
    type: String,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  date: String,
  num: Number,
  answers: [Number],
  questionIds: [
    {
      type: String,
      required: true,
    },
  ],
});

const Test = mongoose.model<ITest>("tests", testSchema);

export default Test;
