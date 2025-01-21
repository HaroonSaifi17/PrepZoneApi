import mongoose, { Document, Schema } from "mongoose";

export interface IPdf extends Document {
  name: string;
  url: string;
  subject: "physics" | "chemistry" | "mathematics" | "biology" | "all";
}

const pdfSchema = new Schema<IPdf>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    subject: {
      type: String,
      enum: ["physics", "chemistry", "mathematics", "biology"],
      required: true,
    },
  },
  { timestamps: true },
);

const Pdf = mongoose.model<IPdf>("Pdf", pdfSchema);

export default Pdf;
