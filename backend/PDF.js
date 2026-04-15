import PDFDocument from "pdfkit";
import Ticket from "../models/incident.js"; // ✅ FIX

export const generateIncidentPDF = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate("createdBy assignedTo");

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=INC-${ticket.ticketId}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(18).text("INCIDENT REPORT", { align: "center" });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Ticket ID: ${ticket.ticketId}`);
  doc.text(`Title: ${ticket.title}`);
  doc.text(`Department: ${ticket.department}`);
  doc.text(`Priority: ${ticket.priority}`);
  doc.text(`Status: ${ticket.status}`);
  doc.text(`Created By: ${ticket.createdBy?.username || "N/A"}`);
  doc.moveDown();

  doc.text("Description:");
  doc.text(ticket.description);
  doc.moveDown();

  doc.text("Resolution:");
  doc.text(ticket.resolution || "Not resolved yet");

  doc.end();
};
