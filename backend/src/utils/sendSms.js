import axios from "axios";

const normalizePhone = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return null;

  if (raw.startsWith("+")) {
    const digits = raw.slice(1).replace(/\D/g, "");
    return digits.length >= 8 ? `+${digits}` : null;
  }

  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.length === 10) {
    const countryCode = process.env.SMS_COUNTRY_CODE?.trim() || "91";
    return `+${countryCode}${digits}`;
  }

  if (digits.length >= 11) {
    return `+${digits}`;
  }

  return null;
};

const getTwilioConfig = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();

  if (!sid || !token || !from) return null;
  return { sid, token, from };
};

const sendWithTwilio = async ({ to, message }) => {
  const cfg = getTwilioConfig();
  if (!cfg) return false;

  const normalizedTo = normalizePhone(to);
  if (!normalizedTo) {
    throw new Error("Invalid phone number format");
  }

  const payload = new URLSearchParams({
    To: normalizedTo,
    From: cfg.from,
    Body: message,
  });

  await axios.post(
    `https://api.twilio.com/2010-04-01/Accounts/${cfg.sid}/Messages.json`,
    payload.toString(),
    {
      auth: {
        username: cfg.sid,
        password: cfg.token,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 20000,
    }
  );

  return true;
};

const sendSms = async ({ to, message }) => {
  if (!to || !message) {
    throw new Error("SMS payload is incomplete");
  }

  const sent = await sendWithTwilio({ to, message });
  if (sent) return;

  throw new Error(
    "SMS provider not configured (set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER)"
  );
};

export default sendSms;
