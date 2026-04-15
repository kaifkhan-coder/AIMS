import { askLLM } from "../llmService.js";

export const generateClosingShayari = async (incident) => {
  const status = incident.status;

  let emotion = "relief";

  if (status === "Resolved") emotion = "relief";
  if (incident.priority === "Critical") emotion = "sad";
  if (status === "Closed") emotion = "happy";

  const prompt = `
You are a poetic AI assistant.

Generate a short Hindi shayari for IT ticket closure.

Context:
- Ticket: ${incident.title}
- Status: ${status}
- Emotion: ${emotion}

Rules:
- 2 to 4 lines only
- Emotional but professional
- No hashtags, no explanation
- Must reflect emotion: ${emotion}
`;

  const result = await askLLM(prompt);
  return result;
};