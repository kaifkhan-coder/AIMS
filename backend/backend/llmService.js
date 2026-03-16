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
export const askLLM = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for IT incident management.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    return response.choices?.[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.error("LLM ASK ERROR:", err.message);
    return "";
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
    const prompt = `
You are classifying an incident for an internal helpdesk system.

Return ONLY valid JSON:
{
  "department": "IT" | "Network" | "Hardware" | "Accounts" | "General",
  "priority": "Low" | "Medium" | "High" | "Critical"
}

Rules:
- IT = login issues, unauthorized access, password issues, software bugs, server/app problems, security-related login events
- Network = wifi, internet, router, switch, DNS, LAN, connectivity issues
- Hardware = printer, keyboard, mouse, monitor, CPU, laptop physical issues
- Accounts = billing, invoice, refund, salary, finance
- General = anything else

Incident:
Title: "${title}"
Description: "${description}"
`.trim();

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

export default openai;