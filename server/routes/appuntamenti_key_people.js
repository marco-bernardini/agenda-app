import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import pool from "../models/db.js";

const router = express.Router();

router.use(authenticateToken);

// Get all links
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM appuntamenti_key_people");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero dei dati appuntamenti_key_people." });
  }
});

// Add a key person to an appointment
router.post("/", async (req, res) => {
  const { id_appuntamento, id_person } = req.body;
  if (!id_appuntamento || !id_person) {
    return res.status(400).json({ error: "id_appuntamento e id_person sono obbligatori." });
  }
  try {
    await pool.query(
      "INSERT INTO appuntamenti_key_people (id_appuntamento, id_person) VALUES ($1, $2)",
      [id_appuntamento, id_person]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(400).json({ error: err.message });
  }
});

// Remove a key person from an appointment
router.delete("/", async (req, res) => {
  const { id_appuntamento, id_person } = req.body;
  if (!id_appuntamento || !id_person) {
    return res.status(400).json({ error: "id_appuntamento e id_person sono obbligatori." });
  }
  try {
    await pool.query(
      "DELETE FROM appuntamenti_key_people WHERE id_appuntamento = $1 AND id_person = $2",
      [id_appuntamento, id_person]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Errore nella rimozione del collegamento." });
  }
});

export default router;