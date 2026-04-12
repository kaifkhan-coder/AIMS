import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const DEPARTMENTS = [
  "IT Support",
  "Network",
  "Hardware",
  "Software",
  "Accounts",
  "HR",
  "General"
];

export const classifyDepartment = async (title, description) => {
  const prompt = `
You are a helpdesk ticket classifier.

Choose ONLY ONE department from the list:
${DEPARTMENTS.join(", ")}

Ticket Title: ${title}
Ticket Description: ${description}

Return only the department name.
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0
  });

  const department = response.choices[0].message.content.trim();

  return DEPARTMENTS.includes(department) ? department : "General";
};
