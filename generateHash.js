const bcrypt = require("bcrypt");

const password = "MasterAdmin123"; // Replace with your desired password

bcrypt.hash(password, 10).then(hash => {
  console.log("Generated Hash:", hash);
});
