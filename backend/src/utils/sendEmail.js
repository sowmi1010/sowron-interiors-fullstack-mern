import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// verify only in dev
if (process.env.NODE_ENV !== "production") {
  transporter.verify((err) => {
    if (err) {
      console.error("❌ Email error:", err.message);
    } else {
      console.log("✅ Email ready");
    }
  });
}

const sendEmail = async ({ to, subject, html }) => {
  if (!to || !subject || !html) {
    throw new Error("Missing email parameters");
  }

  return transporter.sendMail({
    from: `"Sowron Interiors" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
