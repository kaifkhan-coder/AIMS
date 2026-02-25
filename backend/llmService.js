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

// NOTE: mongoose import not needed here; removed to avoid unused import warnings

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// 🔒 INTERNAL DEPARTMENTS
const INTERNAL_DEPARTMENTS = ["IT", "Network", "Hardware", "Accounts", "General"];

// 🔁 MAP LLM → INTERNAL
const LLM_DEPT_MAP = {
  Network: "Network",
  Hardware: "Hardware",
  Software: "IT",
  Security: "IT",
  Admin: "General",
};

// ✅ Keyword-based quick classifier (high accuracy for common cases)
function keywordClassify(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();

  // Network keywords (Cable cut included ✅)
  const networkKw = [
    "cable cut",
    "cablecut",
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

  // Hardware keywords
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

  // Accounts keywords
  const accountsKw = [
    "invoice",
    "billing",
    "payment",
    "refund",
    "salary",
    "expense",
    "account",
    "accounts",
  ];

  // IT/Software keywords
  const itKw = [
    "software",
    "app",
    "application",
    "login",
    "password",
    "bug",
    "error",
    "crash",
    "server",
    "database",
    "api",
    "not working",
  ];

  const hasAny = (arr) => arr.some((k) => text.includes(k));

  if (hasAny(networkKw)) return { department: "Network" };
  if (hasAny(hardwareKw)) return { department: "Hardware" };
  if (hasAny(accountsKw)) return { department: "Accounts" };
  if (hasAny(itKw)) return { department: "IT" };

  return null; // no keyword match
}

// ✅ Extract JSON safely even if model adds extra text
function safeJsonParse(rawText = "") {
  // Try direct parse
  try {
    return JSON.parse(rawText);
  } catch (e) {}

  // Try to extract first JSON object block
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch (e) {
    return null;
  }
}

/* ===============================
   INCIDENT CLASSIFICATION
================================ */
export async function classifyIncident(title, description) {
  try {
    // 1) Keyword-first (fast & stable)
    const kw = keywordClassify(title, description);
    if (kw?.department) {
      return {
        department: kw.department,
        priority: "Low", // default priority; you can add keyword priority rules too
      };
    }

    // 2) LLM classification fallback
    const prompt = `
You are classifying an IT incident.
Return ONLY valid JSON (no markdown, no extra text).

Schema:
{
  "department": "Network" | "Hardware" | "Software" | "Security" | "Admin",
  "priority": "High" | "Medium" | "Low"
}

Rules:
- Network: internet, wifi, router, switch, LAN, DNS, IP, cable cut, connectivity issues
- Hardware: physical devices (printer, monitor, keyboard, mouse, laptop)
- Software: app bugs, login issues, server/app errors
- Security: malware, suspicious access, phishing, breaches
- Admin: general admin requests

Incident:
Title: "${title}"
Description: "${description}"
`.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (response.choices?.[0]?.message?.content || "").trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();

    const result = safeJsonParse(cleaned);

    // 3) Validation + mapping
    const deptFromLlm = result?.department;
    const prFromLlm = result?.priority;

    const mappedDepartment = LLM_DEPT_MAP[deptFromLlm] || "General";

    return {
      department: INTERNAL_DEPARTMENTS.includes(mappedDepartment)
        ? mappedDepartment
        : "General",
      priority: ["High", "Medium", "Low"].includes(prFromLlm)
        ? prFromLlm
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
