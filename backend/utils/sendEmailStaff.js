import nodemailer from "nodemailer";

export const sendEmailWithAttachment = async ({
  to,
  subject,
  text,
  filename,
  content,
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Incident System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    attachments: [
      {
        filename,
        content,
      },
    ],
  });
};
