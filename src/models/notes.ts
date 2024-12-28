import mongoose, { Document, Schema } from "mongoose";

interface IPdf extends Document {
  name?: string;
  date?: string;
  url?: string;
  subject?: string;
}

const pdfSchema = new Schema<IPdf>({
  name: String,
  date: String,
  url: String,
  subject: String,
});

const Pdf = mongoose.model<IPdf>("Pdf", pdfSchema);

export default Pdf;
