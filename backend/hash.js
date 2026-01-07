import bcrypt from "bcryptjs";

bcrypt.hash("Admin@123", 10).then((hash) => {
  console.log("HASH =", hash);
  process.exit();
});
