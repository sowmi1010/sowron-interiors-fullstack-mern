import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Usage: node hash.js <password>");
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log("HASH =", hash);
  process.exit(0);
});
