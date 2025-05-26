import express from "express";
import db from "../models/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

// Get all appointment_key_person entries
router.get("/", async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM appointment_key_person");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero dei dati appointment_key_person." });
  }
});

// Get all key people for a specific appointment
router.get("/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const rows = await db.all(
      `SELECT kp.* FROM appointment_key_person akp
       JOIN key_people kp ON akp.key_person_id = kp.id
       WHERE akp.appointment_id = ?`,
      appointmentId
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero dei key people per appuntamento." });
  }
});

// Add a key person to an appointment
router.post("/", async (req, res) => {
  const { appointment_id, key_person_id } = req.body;
  if (!appointment_id || !key_person_id) {
    return res.status(400).json({ error: "appointment_id e key_person_id sono obbligatori." });
  }
  try {
    await db.run(
      `INSERT INTO appointment_key_person (appointment_id, key_person_id) VALUES (?, ?)`,
      appointment_id,
      key_person_id
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove a key person from an appointment
router.delete("/", async (req, res) => {
  const { appointment_id, key_person_id } = req.body;
  if (!appointment_id || !key_person_id) {
    return res.status(400).json({ error: "appointment_id e key_person_id sono obbligatori." });
  }
  try {
    await db.run(
      `DELETE FROM appointment_key_person WHERE appointment_id = ? AND key_person_id = ?`,
      appointment_id,
      key_person_id
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Errore nella rimozione del collegamento." });
  }
});

export default router;