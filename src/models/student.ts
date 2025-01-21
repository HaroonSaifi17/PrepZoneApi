import mongoose, { Document, Schema } from "mongoose";
import {
  IJEEMetrics,
  INEETMetrics,
  JEEMetricsSchema,
  NEETMetricsSchema,
} from "./examMatrics";

export interface IStudent extends Document {
  name: string;
  email: string;
  phoneNumber: number;
  profileImg: string;
  examType: "JEE" | "NEET";
  results: Schema.Types.ObjectId[];
  examMetrics: {
    JEE: IJEEMetrics;
    NEET: INEETMetrics;
  };
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: Number },
    profileImg: { type: String },
    examType: {
      type: String,
      enum: ["JEE", "NEET"],
    },
    results: [{ type: Schema.Types.ObjectId, ref: "results" }],
    examMetrics: {
      JEE: JEEMetricsSchema,
      NEET: NEETMetricsSchema,
    },
  },
  { timestamps: true },
);

const Student = mongoose.model<IStudent>("students", StudentSchema);
export default Student;
