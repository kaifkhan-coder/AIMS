import mongoose from "mongoose";

const slaSchema = new mongoose.Schema({
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    required: true
  },
  hours: {
    type: Number,
    required: true
  }
});

export default mongoose.model("SLA", slaSchema);
