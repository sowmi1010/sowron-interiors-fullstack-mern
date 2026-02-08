import nodemailer from "nodemailer";
import { Resend } from "resend";

let transporter;
let resendDisabled = false;

const providerModes = new Set(["auto", "resend", "smtp"]);
const apiKeyPattern = /^re_[A-Za-z0-9_-]+$/;

const parseBoolean = (value, defaultValue = false) => {
  if (typeof value !== "string") return defaultValue;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

const parseNumber = (value, defaultValue) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : defaultValue;
};

const sanitizeSecret = (value) =>
  typeof value === "string" ? value.replace(/\s+/g, "").trim() : "";

const getResendClient = () => {
  const apiKey = sanitizeSecret(process.env.RESEND_API_KEY);
  if (apiKey && !apiKeyPattern.test(apiKey)) {
    console.error(
      "RESEND CONFIG ERROR: RESEND_API_KEY format looks invalid. It must start with 're_'."
    );
  }
  return apiKey ? new Resend(apiKey) : null;
};

const getEmailProviderMode = () => {
  const envMode = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  const fallback = isRenderRuntime() ? "resend" : "auto";
  const raw = envMode || fallback;
  return providerModes.has(raw) ? raw : "auto";
};

const isRenderRuntime = () =>
  parseBoolean(process.env.RENDER, false) ||
  Boolean(process.env.RENDER_SERVICE_ID);

const getNetworkOptions = () => {
  const family = parseNumber(process.env.EMAIL_DNS_FAMILY, 4);
  return {
    family: family === 4 || family === 6 ? family : 4,
    connectionTimeout: parseNumber(process.env.EMAIL_CONNECTION_TIMEOUT, 20000),
    greetingTimeout: parseNumber(process.env.EMAIL_GREETING_TIMEOUT, 15000),
    socketTimeout: parseNumber(process.env.EMAIL_SOCKET_TIMEOUT, 30000),
  };
};

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST?.trim();
  const port = parseNumber(process.env.EMAIL_PORT, 0);
  const user = process.env.EMAIL_USER?.trim();
  const pass = sanitizeSecret(process.env.EMAIL_PASS);

  if (!user || !pass) {
    throw new Error("EMAIL_USER and EMAIL_PASS are required for SMTP fallback");
  }

  const networkOptions = getNetworkOptions();
  const smtpHost = host || "smtp.gmail.com";
  const smtpPort = port || 587;
  const secure = parseBoolean(process.env.EMAIL_SECURE, smtpPort === 465);

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure,
    auth: { user, pass },
    ...networkOptions,
  });

  return transporter;
};

const trySendWithResend = async ({ to, subject, html }) => {
  if (resendDisabled) return false;

  const resend = getResendClient();
  if (!resend) return false;

  const from =
    process.env.RESEND_FROM?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    "Sowron <onboarding@resend.dev>";

  try {
    const result = await resend.emails.send({ from, to, subject, html });

    if (result?.error) {
      const statusCode = Number(result.error.statusCode || 0);
      const message = result.error.message || String(result.error);
      console.error("RESEND SEND ERROR:", message);
      if (statusCode === 401 || statusCode === 403) {
        resendDisabled = true; // permanent auth failure; avoid retrying on every request
      }
      return false;
    }

    return true;
  } catch (err) {
    console.error("RESEND SEND ERROR:", err?.message || err);
    const statusCode = Number(err?.statusCode || err?.status || 0);
    if (statusCode === 401 || statusCode === 403) {
      resendDisabled = true;
    }
    return false;
  }
};

const sendEmail = async ({ to, subject, html }) => {
  if (!to || !subject || !html) {
    throw new Error("Email payload is incomplete");
  }

  const providerMode = getEmailProviderMode();
  const allowResend = providerMode === "auto" || providerMode === "resend";
  const allowSmtp = providerMode === "auto" || providerMode === "smtp";

  if (allowResend && (await trySendWithResend({ to, subject, html }))) {
    return;
  }

  if (!allowSmtp) {
    throw new Error(
      "Email provider is set to Resend only, but Resend send failed. Check RESEND_API_KEY and RESEND_FROM."
    );
  }

  const from = process.env.EMAIL_FROM?.trim() || process.env.EMAIL_USER?.trim();
  if (!from) {
    throw new Error(
      "Email sender not configured (set RESEND_FROM/RESEND_API_KEY or EMAIL_FROM/EMAIL_USER)"
    );
  }

  try {
    return await getTransporter().sendMail({
      from,
      to,
      subject,
      html,
    });
  } catch (err) {
    const isTimeout =
      err?.code === "ETIMEDOUT" ||
      err?.code === "ESOCKET" ||
      /timed?out/i.test(String(err?.message || ""));

    if (isTimeout) {
      if (isRenderRuntime()) {
        throw new Error(
          "SMTP timeout on Render. On Render Free plans, outbound SMTP ports are blocked. Use RESEND_API_KEY + RESEND_FROM, or upgrade the service plan."
        );
      }

      throw new Error(
        "SMTP timeout. Check EMAIL_HOST/EMAIL_PORT, firewall, or use RESEND_API_KEY."
      );
    }

    throw err;
  }
};

export default sendEmail;
