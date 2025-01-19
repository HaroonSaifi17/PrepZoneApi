import mongoose, { Document, Schema } from "mongoose";

export interface ITest extends Document {
  name: string;
  subject: "physics" | "chemistry" | "mathematics" | "biology" | "all";
  exam: 'JEE' | 'NEET';
  totalQuestions: number;
  totalNumerical: number;
  correctOptions: number[];
  questionIds: string[];
}

const testSchema = new Schema<ITest>({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    Enum: ["physics", "chemistry", "mathematics", "biology", "all"],
    required: true,
  },
  exam: {
    type: String,
    enum: ["JEE", "NEET"],
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  totalNumerical: Number,
  correctOptions: {
    type: [Number],
    required: true,
  },
  questionIds: [
    {
      type: Schema.Types.ObjectId,
      required: true,
    },
  ],
}, { timestamps: true });

const Test = mongoose.model<ITest>("tests", testSchema);

export default Test;
