import { llmPredictPriority } from "../services/aiPriorityService.js";

const ALLOWED = ["Low", "Medium", "High", "Critical"];

export const predictPriority = async (req, res) => {
  try {
    const { title = "", description = "", category = "" } = req.body;

    if (!title.trim() || !description.trim()) {
      return res.status(400).json({ message: "title and description are required" });
    }

    const predicted = await llmPredictPriority({ title, description, category });

    const priority = ALLOWED.includes(predicted) ? predicted : "Low";
    return res.json({ priority });
  } catch (err) {
    console.error("predictPriority error:", err?.message || err);
    // fallback if anything fails
    return res.json({ priority: "Low" });
  }
};