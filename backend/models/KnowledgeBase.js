import mongoose from "mongoose";

const knowledgeBaseSchema = new mongoose.Schema({
  title: String,
  keywords: [String],
  department: String,
  problemType: String,
  solutionSteps: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("KnowledgeBase", knowledgeBaseSchema);