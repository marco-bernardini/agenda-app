import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../models/db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  return res.status(403).json({ error: "Registration is disabled. Ask the admin (marco.bernardini@sdggroup.com) to add you." });
});

router.post("/login", async (req, res) => {
  console.log("Login route hit", req.body);
  const { username, password } = req.body;
  try {
    // Use PostgreSQL to get user by username
    const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = rows[0];
    console.log("DB result", user);
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ error: "Invalid credentials." });
    }
    const valid = await bcrypt.compare(password, user.password);
    console.log("Bcrypt compare", valid);
    if (!valid) {
      console.log("Invalid password");
      return res.status(401).json({ error: "Invalid credentials." });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "2h" });
    console.log("Login successful, sending token");
    res.json({ token });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ error: "Server error." });
  }
});

export default router;