import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import pool from "../models/db.js";

const router = express.Router();

router.use(authenticateToken);

// Get all clienti
router.get("/", async (req, res) => {
  const { rows: clienti } = await pool.query("SELECT * FROM clienti");
  res.json(clienti);
});

// Add a new cliente
router.post("/", async (req, res) => {
  const {
    denominazione_cliente,
    settore,
    gruppo,
    ramo,
    capitale_sociale,
    fatturato,
    sede,
    sito_web
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO clienti 
        (denominazione_cliente, settore, gruppo, ramo, capitale_sociale, fatturato, sede, sito_web)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [denominazione_cliente, settore, gruppo, ramo, capitale_sociale, fatturato, sede, sito_web]
    );
    const stmt = result.rows[0];
    res.json({ id: stmt.id });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Errore del server." });
  }
});

// Edit a cliente
router.put("/:id", async (req, res) => {
  const {
    denominazione_cliente,
    settore,
    gruppo,
    ramo,
    capitale_sociale,
    fatturato,
    sede,
    sito_web
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE clienti SET
         denominazione_cliente = $1,
         settore = $2,
         gruppo = $3,
         ramo = $4,
         capitale_sociale = $5,
         fatturato = $6,
         sede = $7,
         sito_web = $8
       WHERE id = $9 RETURNING id`,
      [denominazione_cliente, settore, gruppo, ramo, capitale_sociale, fatturato, sede, sito_web, req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Cliente non trovato" });
    }
    res.json({ id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Errore del server." });
  }
});

export default router;