import axios from "axios";

export const sendOtpSms = async ({ phone, otp }) => {
  if (!process.env.FAST2SMS_API_KEY) {
    throw new Error("FAST2SMS_API_KEY not configured");
  }

  const payload = {
    variables_values: otp,
    route: "otp",
    numbers: phone,
  };

  const response = await axios.post(
    "https://www.fast2sms.com/dev/bulkV2",
    payload,
    {
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
        "content-type": "application/json",
        accept: "*/*",
      },
      timeout: 15000,
    }
  );

  return response.data;
};
