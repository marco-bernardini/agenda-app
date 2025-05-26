import express from "express";
import db from "../models/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

// Get all appointment_sdg_group entries
router.get("/", async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM appointment_sdg_group");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero dei dati appointment_sdg_group." });
  }
});

// POST /appointment-sdg-group
router.post("/", async (req, res) => {
  const { appointment_id, sdg_group_id } = req.body;
  if (!appointment_id || !sdg_group_id) {
    return res.status(400).json({ error: "appointment_id e sdg_group_id sono obbligatori." });
  }
  try {
    await db.run(
      `INSERT INTO appointment_sdg_group (appointment_id, sdg_group_id) VALUES (?, ?)`,
      appointment_id,
      sdg_group_id
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;