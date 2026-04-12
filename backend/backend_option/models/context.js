import mongoose from "mongoose";

const contextSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true }, // "college", "hospital"
    name: { type: String, required: true },              // "College AIMS"

    // dynamic categories (don’t use enums in Incident)
    categories: [{ type: String, required: true }],

    // routing rules: category -> department + default assignee role
    routingRules: [
      {
        category: { type: String, required: true },
        department: { type: String, required: true }, // "IT", "Network", "Maintenance"
        assignRole: { type: String, default: null },  // "network_admin"
        slaHours: { type: Number, default: 24 },      // SLA by category
        proofRequired: { type: Boolean, default: false },
        duplicateWindowMins: { type: Number, default: 1440 }, // 24h
      },
    ],

    // optional: departments list
    departments: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Context", contextSchema);