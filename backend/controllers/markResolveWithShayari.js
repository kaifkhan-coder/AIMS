import Incident from "../models/incident.js";
import { askLLM } from "../llmService.js";

export const markResolvedWithShayari = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // ✅ If already resolved, return existing data
    if (incident.status === "Resolved") {
      return res.json({
        message: "Already resolved",
        incident,
        shayari: incident.closingShayari || "",
      });
    }

    // ✅ Update status
    incident.status = "Resolved";
    incident.resolvedAt = new Date();

    // ✅ Generate shayari ONLY ONCE
    const prompt = `
Write a short Hinglish shayari (2-4 lines) for resolved IT ticket.

Title: ${incident.title}
Department: ${incident.department}

Tone: happy, tech, satisfying.
Return only shayari.
`;

    const result = await askLLM(prompt);

    incident.closingShayari = result;

    await incident.save();

    res.json({
      message: "Ticket resolved successfully",
      incident,
      shayari: result, // ✅ direct return
    });

  } catch (err) {
    console.error("RESOLVE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export default markResolvedWithShayari;