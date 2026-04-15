import express from "express";
// import { askLLM } from "../utils/ai.js";
import { askLLM, askLLMStream } from "../llmService.js";
import KnowledgeBase from "../models/KnowledgeBase.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Chatbot endpoint is working!" });
});
router.post("/chat", async (req, res) => {
  const { message, userId } = req.body;

  try {
const msg = message.toLowerCase().trim();

// ✅ HANDLE BEFORE LLM
if (/who.*(create|created|made).*(you|bot)/.test(msg)) {
  return res.end(
    "I am an AI Support Agent built by Khan Mohammed Kaif 👨‍💻 as part of the AIMS (AI-powered Incident Management System) project."
  );
}

if (msg.includes("aims")) {
  return res.end(
    `AIMS stands for AI-powered Incident Management System.
It allows users to report issues, get AI solutions, and create tickets if needed.`
  );
}
if (
  msg.includes("who created this project") ||
  msg.includes("who is creator") ||
  msg.includes("project creator")
) {
  return res.json({
    type: "ai",
    answer: "This project is created by Khan Mohammed Kaif 👨‍💻",
    askTicket: false
  });
}
// 🎯 PREDEFINED INTELLIGENT ANSWERS
if (msg.includes("who") && msg.includes("project")) {
  return res.json({
    type: "ai",
    answer: "This project is developed by Khan Mohammed Kaif, an IT diploma student specializing in AI/ML and full-stack development.",
    askTicket: false
  });
}
if (/who.*(create|created|made).*(you|bot)/.test(msg)) {
  return res.json({
    type: "ai",
    answer: "I am an AI Support Agent built by Khan Mohammed Kaif 👨‍💻 as part of the AIMS project.",
    askTicket: false
  });
}
// 🎯 PREDEFINED INTELLIGENT ANSWERS

// 👨‍💻 Project Creator
if (
  (msg.includes("who") && msg.includes("you")) ||
  msg.includes("who created you") ||
  msg.includes("who create you") ||
  msg.includes("who made you")
) {
  return res.json({
    type: "ai",
    answer: "I am an AI Support Agent built by Khan Mohammed Kaif 👨‍💻 as part of the AIMS (AI-powered Incident Management System) project.",
    askTicket: false
  });
}

// 🤖 About Bot
if (
  msg.includes("who") && (msg.includes("you") || msg.includes("bot")) ||
  msg.includes("what are you")
) {
  return res.json({
    type: "ai",
    answer: "I am an AI Support Agent built by Khan Mohammed Kaif to assist users, provide solutions, and automate the support system.",
    askTicket: false
  });
}
// 🌍 MULTI-LANGUAGE PROJECT EXPLANATION

if (msg.includes("about project") || msg.includes("explain project") || msg.includes("project details")) {

  // 🇮🇳 HINDI
  if (msg.includes("hindi")) {
    return res.json({
      type: "ai",
      answer: "यह एक AI आधारित Incident Management System है। इसमें यूज़र अपनी समस्याएँ रिपोर्ट कर सकते हैं, AI तुरंत समाधान देता है, और यदि समस्या हल नहीं होती तो टिकट बनाकर स्टाफ को भेजा जाता है। इसमें रियल-टाइम अपडेट, ऑटोमेशन और स्मार्ट फीचर्स शामिल हैं।",
      askTicket: false
    });
  }

  // 🇵🇰 URDU
  if (msg.includes("urdu")) {
    return res.json({
      type: "ai",
      answer: "یہ ایک AI پر مبنی Incident Management System ہے۔ صارف اپنی مسئلہ رپورٹ کر سکتا ہے، AI فوری حل فراہم کرتا ہے، اور اگر مسئلہ حل نہ ہو تو ٹکٹ بنا کر اسٹاف کو بھیج دیا جاتا ہے۔ اس میں رئیل ٹائم اپڈیٹس اور اسمارٹ آٹومیشن شامل ہیں۔",
      askTicket: false
    });
  }

  // 🇫🇷 FRENCH
  if (msg.includes("french")) {
    return res.json({
      type: "ai",
      answer: "Ceci est un système de gestion des incidents basé sur l'IA. Les utilisateurs peuvent signaler des problèmes, l'IA fournit des solutions instantanées, et si le problème n'est pas résolu, un ticket est créé et assigné au personnel.",
      askTicket: false
    });
  }

  // 🇪🇸 SPANISH
  if (msg.includes("spanish")) {
    return res.json({
      type: "ai",
      answer: "Este es un sistema de gestión de incidentes basado en IA. Los usuarios pueden reportar problemas, la IA proporciona soluciones y, si no se resuelve, se crea un ticket para el personal.",
      askTicket: false
    });
  }

  // 🇬🇧 DEFAULT (ENGLISH)
  return res.json({
    type: "ai",
    answer: "This is an AI-powered Incident Management System. Users can report issues, AI suggests solutions using a knowledge base, and if unresolved, tickets are created and assigned to staff. It supports real-time updates, automation, and smart workflows.",
    askTicket: false
  });
}
    if (msg.includes("how it works") || msg.includes("working")) {
      return res.json({
        type: "ai",
        answer: "This is an AI-powered Incident Management System. Users can report issues, AI suggests solutions using a knowledge base, and if unresolved, tickets are created and assigned to staff. It also supports real-time updates, escalation, and smart automation.",
        askTicket: false
      });
    }

    if (msg.includes("features")) {
      return res.json({
        type: "ai",
        answer: "Key features include: AI chatbot support, ticket management system, role-based dashboards (admin/staff/user), real-time notifications, SLA tracking, escalation system, and WhatsApp/live chat integration.",
        askTicket: false
      });
    }

    if (msg.includes("technology") || msg.includes("tech stack")) {
      return res.json({
        type: "ai",
        answer: "This project uses MERN stack: MongoDB, Express.js, React.js, Node.js. It also integrates AI (LLM), Socket.io for real-time updates, and external APIs for automation.",
        askTicket: false
      });
    }

    if (msg.includes("college") || msg.includes("where built")) {
      return res.json({
        type: "ai",
        answer: "This project is developed as a final year diploma project at M.H. Saboo Siddik Polytechnic, Mumbai.",
        askTicket: false
      });
    }

    // 🔍 STEP 1: Knowledge Base
    const keywords = msg.split(" ");
    
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
You are an AI Support Agent for AIMS.

AIMS = AI-powered Incident Management System.

Rules:
- NEVER expand AIMS incorrectly
- Always use correct full form
- Be short, helpful
- If "explain more" → expand
- Reply ONLY in English unless user explicitly uses another language

User: "${message}"

Return JSON:
{
  "answer": "...",
  "askTicket": true/false,
  "priority": "Low/Medium/High"
}
`, userId);

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

router.post("/chat-stream", async (req, res) => {
  const { message } = req.body;

  const msg = message.toLowerCase().trim();

  // ✅ FIX: CUSTOM ANSWERS FIRST
  if (/who.*(create|created|made).*(you|bot)/.test(msg)) {
    res.setHeader("Content-Type", "text/plain");
    return res.end(
      "I am an AI Support Agent built by Khan Mohammed Kaif 👨‍💻 as part of the AIMS (AI-powered Incident Management System) project."
    );
  }

  if (msg.includes("aims")) {
    res.setHeader("Content-Type", "text/plain");
    return res.end(
      `AIMS stands for AI-powered Incident Management System.
It helps users report issues, get AI-based solutions, and create support tickets with real-time tracking.`
    );
  }

  try {
    const prompt = `
You are an AI Support Agent for AIMS.

AIMS = AI-powered Incident Management System.

Rules:
- NEVER give wrong full form
- Reply ONLY in English
- Be short and clear

User: ${message}
`;

    await askLLMStream(prompt, res);

  } catch (err) {
    console.error("❌ STREAM ERROR:", err.message);
    res.status(500).send("Streaming failed");
  }
});

export default router;