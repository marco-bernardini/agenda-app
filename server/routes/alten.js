import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import pool from "../models/db.js";

const router = express.Router();

router.use(authenticateToken);

// Get all alten
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM alten");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero dei colleghi di Alten." });
  }
});

// Add a new alten
router.post("/", async (req, res) => {
  const { id_appuntamento, id_alten } = req.body;
  if (!id_appuntamento || !id_alten) {
    return res.status(400).json({ error: "id_appuntamento e id_alten sono obbligatori." });
  }
  try {
    await pool.query(
      "INSERT INTO appuntamenti_alten (id_appuntamento, id_alten) VALUES ($1, $2)",
      [id_appuntamento, id_alten]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;