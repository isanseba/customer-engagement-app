const bcrypt = require("bcryptjs"); // Use bcryptjs instead of bcrypt

const verifyPassword = async (password, hash) => {
  try {
    const match = await bcrypt.compare(password, hash);
    console.log("Password match:", match);
    return match; // Return the result for reuse
  } catch (err) {
    console.error("Error verifying password:", err);
    return false; // Return false in case of an error
  }
};

// Example usage
const password = "secureAdmin123"; // The plain-text password you are testing
const hash = "$2b$10$pCjmffPBcK8zLfW3Zgz1SeC1mKzz3vU36iMbpvRHmjvCEMN1OnD4e"; // The stored hash

verifyPassword(password, hash)
  .then((match) => {
    if (match) {
      console.log("Password is correct!");
    } else {
      console.log("Password is incorrect.");
    }
  })
  .catch((err) => {
    console.error("Error during verification:", err);
  });