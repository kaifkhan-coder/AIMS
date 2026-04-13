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
You are an AI IT Support Assistant.

User Issue: ${message}

1. Give short solution
2. Ask if user wants to create a ticket

Reply in JSON:
{
  "answer": "...",
  "askTicket": true
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