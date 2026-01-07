import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  try {
    // ✅ TRANSPORTER
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,          // e.g. smtp.gmail.com
      port: process.env.SMTP_PORT,          // 587
      secure: false,                        // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,        // your email
        pass: process.env.SMTP_PASS,        // app password
      },
    });

    // ✅ SEND MAIL
    await transporter.sendMail({
      from: `"Admin Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent to:", to);
  } catch (error) {
    console.error("EMAIL SEND ERROR:", error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;
