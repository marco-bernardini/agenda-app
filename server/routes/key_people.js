import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import pool from "../models/db.js";

const router = express.Router();

router.use(authenticateToken);

// Add a new key person
router.post("/", async (req, res) => {
  const { nome, cognome, id_cliente, ruolo, linkedin } = req.body;
  if (!nome || !cognome || !id_cliente) {
    return res.status(400).json({ error: "nome, cognome e compagnia sono obbligatori." });
  }
  try {
    const result = await pool.query(
      "INSERT INTO key_people (nome, cognome, id_cliente, ruolo, linkedin) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nome, cognome, id_cliente, ruolo || null, linkedin || null]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Errore nell'inserimento della key person." });
  }
});

// Get all key people
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM key_people");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero delle key people." });
  }
});

export default router;