import bcrypt from "bcrypt";

const password = "JoyceOhMyLove4613";
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error("Hashing failed:", err);
  } else {
    console.log("Hashed password:", hash);
  }
});