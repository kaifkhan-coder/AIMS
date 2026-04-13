import express from "express";
import nodemailer from "nodemailer";
import Contact from "../models/Contact.js";

const router = express.Router();

router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // ✅ Save to DB
    const newContact = await Contact.create({
      name,
      email,
      message,
    });

    // ✅ Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL,
      subject: "New Contact Message",
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    res.json({
      message: "Message saved & email sent",
      contact: newContact,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process contact form" });
  }
});

router.get("/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

export default router;