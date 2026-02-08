import nodemailer from "nodemailer";
import { Resend } from "resend";

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
};

const getGmailTransporter = () => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
};

const getFromAddress = ({ provider }) => {
  if (provider === "resend") {
    return process.env.RESEND_FROM?.trim() || "Sowron <onboarding@resend.dev>";
  }

  return (
    process.env.EMAIL_FROM?.trim() ||
    process.env.EMAIL_USER?.trim() ||
    "no-reply@example.com"
  );
};

const toErrorMessage = (err) => {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message || "Unknown error";
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
};

const sendWithResend = async ({ to, subject, html }) => {
  const resend = getResendClient();
  if (!resend) return { ok: false, reason: "RESEND_API_KEY not set" };

  const from = getFromAddress({ provider: "resend" });
  const result = await resend.emails.send({ from, to, subject, html });
  return { ok: true, result };
};

const sendWithGmail = async ({ to, subject, html }) => {
  const transporter = getGmailTransporter();
  if (!transporter) return { ok: false, reason: "EMAIL_USER/EMAIL_PASS not set" };

  const from = getFromAddress({ provider: "gmail" });
  const result = await transporter.sendMail({ from, to, subject, html });
  return { ok: true, result };
};

const sendEmail = async ({ to, subject, html }) => {
  if (!to || !subject || !html) {
    throw new Error("sendEmail requires { to, subject, html }");
  }

  // Prefer Resend on cloud (HTTP API is more reliable than SMTP).
  try {
    const resendAttempt = await sendWithResend({ to, subject, html });
    if (resendAttempt.ok) return resendAttempt.result;
  } catch (err) {
    console.error("RESEND SEND ERROR:", toErrorMessage(err));
  }

  // Fallback to Gmail SMTP if configured.
  try {
    const gmailAttempt = await sendWithGmail({ to, subject, html });
    if (gmailAttempt.ok) return gmailAttempt.result;

    throw new Error(
      `Email not configured (${gmailAttempt.reason}). Set RESEND_API_KEY (and optional RESEND_FROM) or EMAIL_USER/EMAIL_PASS.`
    );
  } catch (err) {
    throw new Error(`Email send failed: ${toErrorMessage(err)}`);
  }
};

export default sendEmail;
