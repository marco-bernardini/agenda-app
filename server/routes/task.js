import express from "express";
import pool from "../models/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

// GET /api/tasks - get all tasks with SDG owner
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        tsk.*, 
        sg.nominativo AS sdg_owner
      FROM task tsk
      LEFT JOIN sdg_group sg ON tsk.id_sdg = sg.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero dei task." });
  }
});

// PATCH /api/tasks/:id/status - toggle or set status
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // expects boolean
  try {
    const { rowCount } = await pool.query(
      "UPDATE task SET status = $1 WHERE id = $2",
      [status, id]
    );
    if (rowCount === 0) return res.status(404).json({ error: "Task not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Errore nell'aggiornamento del task." });
  }
});

// POST /api/tasks - create a new task
router.post("/", async (req, res) => {
  const { descrizione, id_appuntamento, status, id_sdg } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO task (descrizione, id_appuntamento, status, id_sdg) VALUES ($1, $2, $3, $4) RETURNING *",
      [descrizione, id_appuntamento, status, id_sdg]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Errore nella creazione del task." });
  }
});

export default router;