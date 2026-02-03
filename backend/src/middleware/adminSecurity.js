import AdminAudit from "../models/AdminAudit.js";

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || "";
};

export const adminIpWhitelist = (req, res, next) => {
  const listRaw = process.env.ADMIN_IP_WHITELIST || "";
  const list = listRaw
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);

  if (list.length === 0) return next();

  const clientIp = getClientIp(req);
  if (!list.includes(clientIp)) {
    return res.status(403).json({ message: "Admin access denied" });
  }

  next();
};

export const adminAudit = async (req, res, next) => {
  const method = req.method?.toUpperCase?.() || "";
  const shouldLog = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  if (!shouldLog) return next();

  const adminId = req.admin?._id;
  const action = `ADMIN_${method}`;

  try {
    await AdminAudit.create({
      adminId,
      action,
      method,
      path: req.originalUrl || req.path,
      ip: getClientIp(req),
      userAgent: req.headers["user-agent"],
      success: true,
    });
  } catch (err) {
    console.error("ADMIN AUDIT ERROR:", err.message);
  }

  next();
};

export const logAdminAuthEvent = async ({
  adminId,
  action,
  req,
  success = true,
  meta = {},
}) => {
  try {
    await AdminAudit.create({
      adminId,
      action,
      method: req?.method || "POST",
      path: req?.originalUrl || req?.path || "/api/admin",
      ip: getClientIp(req),
      userAgent: req?.headers?.["user-agent"],
      success,
      meta,
    });
  } catch (err) {
    console.error("ADMIN AUTH AUDIT ERROR:", err.message);
  }
};
