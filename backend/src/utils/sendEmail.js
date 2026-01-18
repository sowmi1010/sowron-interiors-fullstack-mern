import nodemailer from "nodemailer";

/* ===========================
   CREATE SINGLE TRANSPORTER
=========================== */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_PORT == 465, // true for 465 only
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
});

/* ===========================
   VERIFY SMTP ON START
=========================== */
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP Connection Failed:", err.message);
  } else {
    console.log("✅ SMTP Server Ready");
  }
});

/* ===========================
   SEND EMAIL FUNCTION
=========================== */
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!to || !subject || !html) {
      throw new Error("Missing email parameters");
    }

    const info = await transporter.sendMail({
      from: `"Sowron Interiors" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Email service temporarily unavailable");
  }
};

export default sendEmail;
