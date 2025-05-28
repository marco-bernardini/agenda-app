import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import pool from "../models/db.js";

const router = express.Router();

router.use(authenticateToken);

// Get all SDG_group entries
router.get("/", async (req, res) => {
  try {
    const { rows: groups } = await pool.query("SELECT * FROM sdg_group");
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero dei colleghi." });
  }
});

// Add a new SDG_group entry
router.post("/", async (req, res) => {
  const { nominativo, business_unit } = req.body;
  if (!nominativo || !business_unit) {
    return res.status(400).json({ error: "nominativo e business_unit sono obbligatori." });
  }
  try {
    const result = await pool.query(
      "INSERT INTO sdg_group (nominativo, business_unit) VALUES ($1, $2) RETURNING *",
      [nominativo, business_unit]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Errore nell'inserimento del collega." });
  }
});

// Delete an SDG_group entry by id
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM sdg_group WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Errore nell'eliminazione del collega." });
  }
});

export default router;