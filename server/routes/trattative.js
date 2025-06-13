import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import pool from "../models/db.js";

const router = express.Router();

router.use(authenticateToken);

// Get all trattative
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM trattative");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero delle trattative." });
  }
});

// Add a new trattativa
router.post("/", async (req, res) => {
  const { denominazione, id_cliente, status, struttura, note, owner } = req.body;
  if (!denominazione || !id_cliente || !status || !struttura || !owner) {
    return res.status(400).json({ error: "denominazione, id_cliente, status, struttura e owner sono obbligatori." });
  }
  try {
    const result = await pool.query(
      "INSERT INTO trattative (denominazione, id_cliente, status, struttura, note, owner) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [denominazione, id_cliente, status, struttura, note || null, owner]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Errore nell'inserimento della trattativa." });
  }
});

// Update only the note of a trattativa
router.patch("/:id/note", async (req, res) => {
  const { note } = req.body;
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE trattative SET note = $1 WHERE id = $2 RETURNING *",
      [note, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Trattativa non trovata." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Errore nell'aggiornamento della nota." });
  }
});

// PATCH /trattative/:id/status
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE trattative SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Trattativa non trovata." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Errore nell'aggiornamento dello status." });
  }
});

export default router;