import crypto from "crypto";

const STOP = new Set([
  "the","a","an","is","are","was","were","to","for","of","and","or","in","on","at","by","with","from",
  "please","urgent","kindly","asap","help"
]);

export const normalizeText = (s = "") => {
  const cleaned = String(s)
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = cleaned.split(" ").filter(t => t && !STOP.has(t) && t.length > 2);
  return tokens.join(" ").slice(0, 500);
};

export const makeFingerprint = ({ department = "General", category = "General", title = "", description = "" }) => {
  const norm = normalizeText(`${title} ${description}`);
  const base = `${department}::${category}::${norm}`;
  return crypto.createHash("sha256").update(base).digest("hex");
};