// // llmService.js
// import dotenv from "dotenv";
// dotenv.config();
// import mongoose from "mongoose";
// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENROUTER_API_KEY,
//   baseURL: "https://openrouter.ai/api/v1",
// });

// // 🔒 INTERNAL DEPARTMENTS
// const INTERNAL_DEPARTMENTS = [
//   "IT",
//   "Network",
//   "Hardware",
//   "Accounts",
//   "General",
// ];

// // 🔁 MAP LLM → INTERNAL
// const LLM_DEPT_MAP = {
//   Network: "Network",
//   Hardware: "Hardware",
//   Software: "IT",
//   Security: "IT",
//   Admin: "General",
// };

// /* ===============================
//    INCIDENT CLASSIFICATION
// ================================ */
// export async function classifyIncident(title, description) {
//   try {
//     const prompt = `
// Return ONLY valid JSON:
// {
//   "department": "Network | Hardware | Software | Security | Admin",
//   "priority": "High | Medium | Low"
// }

// Incident:
// "${title}. ${description}"
// `;

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       temperature: 0,
//       messages: [{ role: "user", content: prompt }],
//     });

//     let text = response.choices[0].message.content
//       .replace(/```json|```/g, "")
//       .trim();

//     const result = JSON.parse(text);

//     const mappedDepartment =
//       LLM_DEPT_MAP[result.department] || "General";

//     return {
//       department: INTERNAL_DEPARTMENTS.includes(mappedDepartment)
//         ? mappedDepartment
//         : "General",
//       priority: ["High", "Medium", "Low"].includes(result.priority)
//         ? result.priority
//         : "Low",
//     };
//   } catch (err) {
//     console.error("LLM CLASSIFY ERROR:", err.message);
//     return {
//       department: "General",
//       priority: "Low",
//     };
//   }
// }

// /* ===============================
//    STAFF SUMMARY
// ================================ */
// export async function generateStaffSummary(tickets) {
//   const prompt = `
// Summarize these tickets for staff in 2 lines:

// ${tickets.map(t => `- ${t.title}: ${t.status}`).join("\n")}
// `;

//   const response = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     temperature: 0.3,
//     messages: [{ role: "user", content: prompt }],
//   });

//   return response.choices[0].message.content;
// }

// export default openai;

// llmService.js
import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});
const conversationMemory = new Map();
const INTERNAL_DEPARTMENTS = ["IT", "Network", "Hardware", "Accounts", "General"];
const INTERNAL_PRIORITIES = ["Low", "Medium", "High", "Critical"];

/* ===============================
   NORMALIZERS
================================ */
function normalizeDepartment(dept = "") {
  const value = String(dept).trim().toLowerCase();

  if (value === "it" || value === "software" || value === "security") {
    return "IT";
  }
  if (value === "network") return "Network";
  if (value === "hardware") return "Hardware";
  if (value === "accounts" || value === "account") return "Accounts";
  return "General";
}

function normalizePriority(priority = "") {
  const value = String(priority).trim().toLowerCase();

  if (value === "critical") return "Critical";
  if (value === "high") return "High";
  if (value === "medium") return "Medium";
  return "Low";
}

/* ===============================
   KEYWORD CLASSIFIER
================================ */
function keywordClassify(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();

  const networkKw = [
    "cable cut",
    "lan",
    "ethernet",
    "router",
    "switch",
    "wifi",
    "wi-fi",
    "internet",
    "network",
    "dns",
    "ip",
    "ping",
    "packet",
    "fiber",
    "broadband",
    "no connection",
    "connection lost",
  ];

  const hardwareKw = [
    "printer",
    "mouse",
    "keyboard",
    "monitor",
    "cpu",
    "fan",
    "disk",
    "ssd",
    "hdd",
    "ram",
    "power supply",
    "laptop",
    "pc not turning on",
    "screen broken",
  ];

  const accountsKw = [
    "invoice",
    "billing",
    "payment",
    "refund",
    "salary",
    "expense",
    "finance",
    "accounts department",
  ];

  const itKw = [
    "login",
    "unauthorized login",
    "unauthorized access",
    "password",
    "signin",
    "sign in",
    "authentication",
    "access denied",
    "account locked",
    "software",
    "application",
    "app",
    "server error",
    "bug",
    "crash",
    "database",
    "system error",
    "security alert",
    "malware",
    "virus",
    "phishing",
  ];

  const hasAny = (arr) => arr.some((k) => text.includes(k));

  if (hasAny(itKw)) return { department: "IT", priority: "High" };
  if (hasAny(networkKw)) return { department: "Network", priority: "Medium" };
  if (hasAny(hardwareKw)) return { department: "Hardware", priority: "Medium" };
  if (hasAny(accountsKw)) return { department: "Accounts", priority: "Medium" };

  return null;
}

/* ===============================
   SAFE JSON PARSER
================================ */
function safeJsonParse(rawText = "") {
  try {
    return JSON.parse(rawText);
  } catch {}

  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

/* ===============================
   GENERIC LLM ASK
================================ */
const SYSTEM_PROMPT = `
You are an AI Support Agent for a project called AIMS.

AIMS = AI-powered Incident Management System.

STRICT RULES:
- NEVER say "Automated Information Management System"
- ALWAYS use: "AI-powered Incident Management System"
- NEVER guess wrong meaning
- If user asks "in detail" → expand answer
- Be clear, structured, helpful
- Detect user language and reply same language
`;
export const askLLM = async (prompt, userId = "default") => {
  try {
    const history = conversationMemory.get(userId) || [];

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },

      ...history, // 🔥 previous conversation

      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages,
      temperature: 0.3,
      max_completion_tokens: 300, // keep small to avoid credit error
    });

    const reply = response.choices?.[0]?.message?.content || "";

    // store memory (last 6 messages)
    conversationMemory.set(userId, [
      ...history,
      { role: "user", content: prompt },
      { role: "assistant", content: reply },
    ].slice(-6));

    return reply;
  } catch (err) {
    console.error(err.message);
    return "Something went wrong.";
  }   
};
export const askLLMStream = async (prompt, res) => {
  try {
    const stream = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini", // ✅ FIXED
      stream: true,
      temperature: 0.2,
      max_completion_tokens: 500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    });

    // ✅ IMPORTANT HEADERS
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of stream) {
      const text = chunk.choices?.[0]?.delta?.content;
      if (text) {
        res.write(text); // 🔥 streaming works here
      }
    }

    res.end();

  } catch (err) {
    console.error("❌ STREAM ERROR:", err);

    // ✅ Send proper error
    if (!res.headersSent) {
      res.status(500).json({ error: "Streaming failed" });
    } else {
      res.end();
    }
  }
};
/* ===============================
   INCIDENT CLASSIFICATION
================================ */
export async function classifyIncident(title, description) {
  try {
    // 1. Keyword first
    const kw = keywordClassify(title, description);
    if (kw) {
      return kw;
    }

    // 2. LLM fallback
//     const prompt = `
// You are classifying an incident for an internal helpdesk system.

// Return ONLY valid JSON:
// {
//   "department": "IT" | "Network" | "Hardware" | "Accounts" | "General",
//   "priority": "Low" | "Medium" | "High" | "Critical"
// }

// Rules:
// - Department must be one of the 5 internal departments only.
// - Priority is based on urgency and impact. Critical = immediate attention needed, High = significant impact, Medium = moderate impact, Low = minor issue.
// - IT = login issues, unauthorized access, password issues, software bugs, server/app problems, security-related login events
// - Network = wifi, internet, router, switch, DNS, LAN, connectivity issues
// - Hardware = printer, keyboard, mouse, monitor, CPU, laptop physical issues
// - Accounts = billing, invoice, refund, salary, finance
// - General = anything else

// Priority Rules:
// - Critical → system down, security breach, server crash
// - High → login issues, access denied, major bug
// - Medium → slow system, partial issues
// - Low → minor UI issues, small bugs

// Incident:
// Title: "${title}"
// Description: "${description}"
// `.trim();

const prompt = `
You are an IT expert.

Analyze this issue and provide a possible root cause.

Rules:
- MUST give answer (no "please clarify")
- Be confident and logical
- Max 2 lines

Incident:
Title: ${title}
Description: ${description}

Root Cause:
`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.choices?.[0]?.message?.content || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const result = safeJsonParse(cleaned);

    return {
      department: INTERNAL_DEPARTMENTS.includes(normalizeDepartment(result?.department))
        ? normalizeDepartment(result?.department)
        : "General",
      priority: INTERNAL_PRIORITIES.includes(normalizePriority(result?.priority))
        ? normalizePriority(result?.priority)
        : "Low",
    };
  } catch (err) {
    console.error("LLM CLASSIFY ERROR:", err.message);
    return { department: "General", priority: "Low" };
  }
}

/* ===============================
   STAFF SUMMARY
================================ */
export async function generateStaffSummary(tickets) {
  try {
    const prompt = `
Summarize these tickets for staff in exactly 2 lines.
Keep it simple and clear.

${tickets.map((t) => `- ${t.title}: ${t.status}`).join("\n")}
`.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices?.[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.error("STAFF SUMMARY ERROR:", err.message);
    return "Summary unavailable right now.";
  }
}

export const generateShayari = async (req, res) => {
  try {
    const ticket = await Incident.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const prompt = `
You are a poetic assistant.

Generate a short Hindi/Hinglish shayari (2–4 lines) when an IT ticket is resolved.

Tone:
- happy
- satisfying
- tech + emotional
- modern

Ticket Title: ${ticket.title}
Department: ${ticket.department}

Return only shayari.
`;

    const result = await askLLM(prompt);

    // ✅ Save in DB (VERY IMPORTANT)
    ticket.closingShayari = result;
    await ticket.save();

    res.json({ shayari: result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate shayari" });
  }
};

export default openai;