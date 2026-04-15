import dotenv from "dotenv";
dotenv.config();
import express from "express";
import axios from "axios";
import {protect} from "../middleware/autMiddleware.js";

const router = express.Router();

router.post("/suggest-description", protect, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const prompt = `
You are a helpdesk system.
Generate a clear, professional support ticket description
based on this title:

Title: "${title}"

Keep it concise and formal.
`;

const response = await axios.post(
  "https://openrouter.ai/api/v1/chat/completions",
  {
    model: "openai/gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a professional IT helpdesk assistant." },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
    max_tokens: 300,
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": `${process.env.FRONTEND_URL}`, // REQUIRED
      "X-Title": "Incident Management System", // REQUIRED
    },
  }
);

const description =
  response.data?.choices?.[0]?.message?.content ||
  "Please describe the issue in detail.";

    res.json({ description });

  } catch (err) {
  console.error("LLM ERROR FULL:", err.response?.data || err.message);

  res.status(500).json({
    message: "LLM failed",
    error: err.response?.data || err.message, // 🔥 important
  });
  }
});
export default router;
