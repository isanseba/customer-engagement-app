const bcrypt = require("bcryptjs"); // Use bcryptjs instead of bcrypt

const generateHash = async (password) => {
  const saltRounds = 10; // Number of salt rounds for bcrypt
  const hash = await bcrypt.hash(password, saltRounds);
  console.log("Generated Hash:", hash);
  return hash; // Return the hash for reuse
};

const verifyHash = async (password, hash) => {
  const isMatch = await bcrypt.compare(password, hash);
  console.log("Password matches hash:", isMatch);
  return isMatch; // Return the result for reuse
};

// Example usage
(async () => {
  const password = "G@J5YjNdGy8@izM"; // Replace with the password you want to hash
  const hash = await generateHash(password);
  await verifyHash(password, hash); // Verify the generated hash
  process.exit();
})().catch((err) => {
  console.error("Error generating or verifying hash:", err);
  process.exit(1);
});