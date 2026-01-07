import jwt from "jsonwebtoken";

export const userAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    next();
  }
};
