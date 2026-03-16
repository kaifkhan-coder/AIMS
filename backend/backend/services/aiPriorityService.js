import axios from "axios";

const ALLOWED = ["Low", "Medium", "High", "Critical"];

// Simple rule fallback if LLM fails
const ruleFallback = ({ title, description }) => {
  const t = (title + " " + description).toLowerCase();
  if (t.includes("breach") || t.includes("down") || t.includes("security") || t.includes("hacked")) return "Critical";
  if (t.includes("urgent") || t.includes("server") || t.includes("payment") || t.includes("network")) return "High";
  if (t.includes("slow") || t.includes("bug") || t.includes("issue")) return "Medium";
  return "Low";
};

export const llmPredictPriority = async ({ title, description, category }) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001";

    if (!apiKey) return ruleFallback({ title, description });

    const prompt = `
You are an IT Incident triage assistant.
Return ONLY one word from this list: Low, Medium, High, Critical.
No explanation.

Inputs:
Title: ${title}
Category: ${category || "General"}
Description: ${description}
`;

    const resp = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model,
        messages: [
          { role: "system", content: "You classify incident priority. Output only one of: Low, Medium, High, Critical." },
          { role: "user", content: prompt }
        ],
        temperature: 0,
        max_tokens: 5
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    const text = resp.data?.choices?.[0]?.message?.content?.trim();
    if (ALLOWED.includes(text)) return text;

    // sometimes model returns "Priority: High"
    const cleaned = (text || "").replace(/[^a-z]/gi, "");
    const normalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
    if (ALLOWED.includes(normalized)) return normalized;

    return ruleFallback({ title, description });
  } catch (err) {
    console.error("LLM priority error:", err?.response?.data || err.message);
    return ruleFallback({ title, description });
  }
};