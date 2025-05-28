import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import pool from "../models/db.js";

const router = express.Router();

router.use(authenticateToken);

// Get all appuntamenti_sdg_group entries
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM appuntamenti_sdg_group");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero dei dati appuntamenti_sdg_group." });
  }
});

// POST /appuntamenti-sdg-group
router.post("/", async (req, res) => {
  const { id_appuntamento, id_sdg } = req.body;
  if (!id_appuntamento || !id_sdg) {
    return res.status(400).json({ error: "id_appuntamento e id_sdg sono obbligatori." });
  }
  try {
    await pool.query(
      "INSERT INTO appuntamenti_sdg_group (id_appuntamento, id_sdg) VALUES ($1, $2)",
      [id_appuntamento, id_sdg]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(400).json({ error: err.message });
  }
});

export default router;