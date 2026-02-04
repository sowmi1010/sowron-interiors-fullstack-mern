import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Many Windows/ISP networks have broken IPv6 routing to SMTP servers which causes
// `connect ETIMEDOUT <ipv6>:587`. Prefer IPv4 for outbound SMTP lookups.
if ((process.env.EMAIL_PREFER_IPV4 || "true").toLowerCase() === "true") {
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 30000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* Verify once */
if (process.env.NODE_ENV !== "production") {
  transporter.verify((err) => {
    if (err) {
      console.error("❌ SMTP Error:", err.message);
    } else {
      console.log("✅ SMTP Ready");
    }
  });
}

const sendEmail = async ({ to, subject, html }) => {
  if (!to || !subject || !html) {
    throw new Error("Missing email parameters");
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email credentials not configured");
  }

  return transporter.sendMail({
    from: `"Sowron Interiors" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
