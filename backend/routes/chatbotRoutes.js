import express from "express";
import KnowledgeBase from "../models/KnowledgeBase.js";
import { askLLM } from "../llmService.js";
import Incident from "../models/incident.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  const { message, userId } = req.body;

  try {
    // 🔍 STEP 1: Search Knowledge Base
    const keywords = message.toLowerCase().split(" ");
    
    const articles = await KnowledgeBase.find({
      keywords: { $in: keywords },
      isActive: true,
    }).limit(3);

    if (articles.length > 0) {
      return res.json({
        type: "solution",
        solutions: articles.map(a => ({
          title: a.title,
          steps: a.solutionSteps
        }))
      });
    }

    // 🤖 STEP 2: AI Response
const reply = await askLLM(`
You are an intelligent IT Support Agent for an Incident Management System.

Rules:
- Be short, clear, and helpful
- If issue is technical → give steps
- If unsure → ask clarification
- Suggest ticket creation ONLY if needed

User Issue: "${message}"

Respond ONLY in JSON:
{
  "answer": "...",
  "askTicket": true/false,
  "priority": "Low/Medium/High"
}
`);

    let parsed;
    try {
      parsed = JSON.parse(reply);
    } catch {
      parsed = { answer: reply, askTicket: true };
    }

    return res.json({
      type: "ai",
      answer: parsed.answer,
      askTicket: parsed.askTicket
    });

  } catch (err) {
    res.status(500).json({ error: "Chat failed" });
  }
});

router.post("/create-ticket", async (req, res) => {
  const { message, userId } = req.body;

  try {
    const incident = await Incident.create({
      title: message.slice(0, 50),
      description: message,
      createdBy: userId,
      status: "Open",
      priority: "Medium",
      department: "IT"
    });

    res.json({
      message: "Ticket created",
      ticketId: incident.ticketId
    });

  } catch (err) {
    res.status(500).json({ error: "Ticket creation failed" });
  }
});

export default router;