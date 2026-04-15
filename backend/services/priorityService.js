export const detectPriority = (text) => {
  text = text.toLowerCase();

  if (text.includes("server down")) return "critical";
  if (text.includes("network")) return "high";
  if (text.includes("slow")) return "medium";
  return "low";
};
