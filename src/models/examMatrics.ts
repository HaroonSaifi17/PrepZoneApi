import { Schema } from "mongoose";

interface ISubjectMetrics {
  accuracy: number;
  timeSpent: number;
}

interface IJEEMetrics {
  topMarks: number;
  averageMarks: number;
  physics: ISubjectMetrics;
  chemistry: ISubjectMetrics;
  mathematics: ISubjectMetrics;
}

interface INEETMetrics {
  topMarks: number;
  averageMarks: number;
  physics: ISubjectMetrics;
  chemistry: ISubjectMetrics;
  biology: ISubjectMetrics;
}

const SubjectMetricsSchema = new Schema<ISubjectMetrics>({
  accuracy: { type: Number, required: true, default: 0 },
  timeSpent: { type: Number, required: true, default: 0 },
});

const JEEMetricsSchema = new Schema<IJEEMetrics>({
  topMarks: { type: Number, required: true, default: 0 },
  averageMarks: { type: Number, required: true, default: 0 },
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
  topMarks: { type: Number, required: true, default: 0 },
  averageMarks: { type: Number, required: true, default: 0 },
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

export { IJEEMetrics, INEETMetrics, JEEMetricsSchema, NEETMetricsSchema };
