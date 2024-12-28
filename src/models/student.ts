import mongoose, { Document, Schema } from "mongoose";

export interface IResult {
  _id: mongoose.Types.ObjectId;
  testId: string;
  date: string;
  correct: number[];
  wrong: number[];
  result: number[];
  time: number;
  marks: number;
  subject: string[];
  name: string;
}

export interface IStudent extends Document {
  name: string;
  email: string;
  phoneNumber?: string;
  profileImg?: string;
  prep?: string;
  results: IResult[];
  topMarks: number[];
  averageMarks: number[];
  physicsAccuracy: number[];
  chemistryAccuracy: number[];
  bioAccuracy: number;
  bioTime: number;
  mathAccuracy: number;
  mathTime: number;
  chemistryTime: number[];
  physicsTime: number[];
}

const resultSchema = new Schema<IResult>({
  testId: String,
  date: String,
  correct: [Number],
  wrong: [Number],
  result: [Number],
  time: Number,
  marks: Number,
  subject: [String],
  name: String,
});

const studentSchema = new Schema<IStudent>({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: String,
  profileImg: String,
  prep: String,
  results: [resultSchema],
  topMarks: {
    type: [Number],
    default: [0, 0],
  },
  averageMarks: {
    type: [Number],
    default: [0, 0],
  },
  physicsAccuracy: {
    type: [Number],
    default: [0, 0],
  },
  chemistryAccuracy: {
    type: [Number],
    default: [0, 0],
  },
  bioAccuracy: {
    type: Number,
    default: 0,
  },
  bioTime: {
    type: Number,
    default: 0,
  },
  mathAccuracy: {
    type: Number,
    default: 0,
  },
  mathTime: {
    type: Number,
    default: 0,
  },
  chemistryTime: {
    type: [Number],
    default: [0, 0],
  },
  physicsTime: {
    type: [Number],
    default: [0, 0],
  },
});

const Student = mongoose.model<IStudent>("students", studentSchema);
export default Student;
