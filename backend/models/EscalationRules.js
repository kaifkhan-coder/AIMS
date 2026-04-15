const escalationRuleSchema = new mongoose.Schema({
  severity: String,
  responseMinutes: Number,
  resolveMinutes: Number,
  escalateTo: { type: String, enum: ["staff", "admin", "super_admin"] }
});