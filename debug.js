const bcrypt = require("bcrypt");

const password = "secureAdmin123"; // The plain-text password you are testing
const hash = "$2b$10$pCjmffPBcK8zLfW3Zgz1SeC1mKzz3vU36iMbpvRHmjvCEMN1OnD4e"; // The stored hash

bcrypt.compare(password, hash).then(match => {
  console.log("Password match:", match);
});
