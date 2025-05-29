import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import pool from "../models/db.js";

const router = express.Router();

router.use(authenticateToken);

// Get all metrics_clienti
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM metrics_clienti");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Errore del server." });
  }
});

// Get all metrics for a specific client
router.get("/client/:id_cliente", async (req, res) => {
  const { id_cliente } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM metrics_clienti WHERE id_cliente = $1 ORDER BY year DESC",
      [id_cliente]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;