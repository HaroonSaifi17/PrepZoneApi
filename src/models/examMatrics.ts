import { Schema } from "mongoose";

interface ISubjectMetrics {
  accuracy: number;
  timeSpent: number;
}

interface IJEEMetrics {
  topScore: number;
  averageScore: number;
  physics: ISubjectMetrics;
  chemistry: ISubjectMetrics;
  mathematics: ISubjectMetrics;
}

interface INEETMetrics {
  topScore: number;
  averageScore: number;
  physics: ISubjectMetrics;
  chemistry: ISubjectMetrics;
  biology: ISubjectMetrics;
}

const SubjectMetricsSchema = new Schema<ISubjectMetrics>({
  accuracy: { type: Number, required: true, default: 0 },
  timeSpent: { type: Number, required: true, default: 0 },
});

const JEEMetricsSchema = new Schema<IJEEMetrics>({
  topScore: { type: Number, required: true, default: 0 },
  averageScore: { type: Number, required: true, default: 0 },
  physics: {
    type: SubjectMetricsSchema,
    required: true,
    default: () => ({
      accuracy: 0,
      timeSpent: 0,
    }),
  },
  chemistry: {
    type: SubjectMetricsSchema,
    required: true,
    default: () => ({
      accuracy: 0,
      timeSpent: 0,
    }),
  },
  mathematics: {
    type: SubjectMetricsSchema,
    required: true,
    default: () => ({
      accuracy: 0,
      timeSpent: 0,
    }),
  },
});

const NEETMetricsSchema = new Schema<INEETMetrics>({
  topScore: { type: Number, required: true, default: 0 },
  averageScore: { type: Number, required: true, default: 0 },
  physics: {
    type: SubjectMetricsSchema,
    required: true,
    default: () => ({
      accuracy: 0,
      timeSpent: 0,
    }),
  },
  chemistry: {
    type: SubjectMetricsSchema,
    required: true,
    default: () => ({
      accuracy: 0,
      timeSpent: 0,
    }),
  },
  biology: {
    type: SubjectMetricsSchema,
    required: true,
    default: () => ({
      accuracy: 0,
      timeSpent: 0,
    }),
  },
});

export interface IExamMetrics {
  JEE: IJEEMetrics;
  NEET: INEETMetrics;
}

export { IJEEMetrics, INEETMetrics, JEEMetricsSchema, NEETMetricsSchema };
