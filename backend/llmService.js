// llmService.js
import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// 🔒 INTERNAL DEPARTMENTS
const INTERNAL_DEPARTMENTS = [
  "IT",
  "Network",
  "Hardware",
  "Accounts",
  "General",
];

// 🔁 MAP LLM → INTERNAL
const LLM_DEPT_MAP = {
  Network: "Network",
  Hardware: "Hardware",
  Software: "IT",
  Security: "IT",
  Admin: "General",
};

/* ===============================
   INCIDENT CLASSIFICATION
================================ */
export async function classifyIncident(title, description) {
  try {
    const prompt = `
Return ONLY valid JSON:
{
  "department": "Network | Hardware | Software | Security | Admin",
  "priority": "High | Medium | Low"
}

Incident:
"${title}. ${description}"
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });

    let text = response.choices[0].message.content
      .replace(/```json|```/g, "")
      .trim();

    const result = JSON.parse(text);

    const mappedDepartment =
      LLM_DEPT_MAP[result.department] || "General";

    return {
      department: INTERNAL_DEPARTMENTS.includes(mappedDepartment)
        ? mappedDepartment
        : "General",
      priority: ["High", "Medium", "Low"].includes(result.priority)
        ? result.priority
        : "Low",
    };
  } catch (err) {
    console.error("LLM CLASSIFY ERROR:", err.message);
    return {
      department: "General",
      priority: "Low",
    };
  }
}

/* ===============================
   STAFF SUMMARY
================================ */
export async function generateStaffSummary(tickets) {
  const prompt = `
Summarize these tickets for staff in 2 lines:

${tickets.map(t => `- ${t.title}: ${t.status}`).join("\n")}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}

export default openai;
