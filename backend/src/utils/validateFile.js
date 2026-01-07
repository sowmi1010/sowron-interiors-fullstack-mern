export const validateImage = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "At least one image required" });
  }
  next();
};
