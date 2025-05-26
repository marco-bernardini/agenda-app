import express from "express";
import db from "../models/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { logAction } from "../utils/logAction.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", async (req, res) => {
  const filter = req.query.filter;
  let query = "SELECT * FROM appointments";

  if (filter && filter !== "tutti") {
    query = `
      SELECT a.* 
      FROM appointments a
      JOIN companies c ON a.cliente = c.compagnia 
      WHERE c.settore = ?
    `;
  }

  try {
    let appointments;
    if (filter && filter !== "tutti") {
      appointments = await db.all(query, [filter]);
    } else {
      appointments = await db.all(query);
    }
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

router.post("/", async (req, res) => {
  const {
    cliente, status, referente_alten, referente_azienda, struttura, data, format,
    referente_sdg, // now an array of IDs
    to_do, next_steps, note
  } = req.body;

  const stmt = await db.run(
    `INSERT INTO appointments (
      user_id, cliente, status, referente_alten, referente_azienda, struttura, data, format, to_do, next_steps, note
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    req.user.id, cliente, status, referente_alten, referente_azienda, struttura, data, format, to_do, next_steps, note
  );
  const appointmentId = stmt.lastID;

  // Insert associations
  if (Array.isArray(referente_sdg)) {
    for (const sdgId of referente_sdg) {
      await db.run(
        "INSERT INTO appointment_sdg_group (appointment_id, sdg_group_id) VALUES (?, ?)",
        appointmentId,
        sdgId
      );
    }
  }

  await logAction({
    user_id: req.user.id,
    action: "add",
    entity: "appointment",
    entity_id: appointmentId,
    details: req.body
  });

  res.json({ id: appointmentId });
});

// Update an appointment by ID
router.put("/:id", async (req, res) => {
  const {
    cliente,
    status,
    referente_alten,
    referente_azienda,
    struttura,
    data,
    format,
    referente_sdg,
    to_do,
    next_steps,
    note
  } = req.body;

  try {
    await db.run(
      `UPDATE appointments SET
        cliente = ?,
        status = ?,
        referente_alten = ?,
        referente_azienda = ?,
        struttura = ?,
        data = ?,
        format = ?,
        referente_sdg = ?,
        to_do = ?,
        next_steps = ?,
        note = ?
      WHERE id = ?`,
      cliente,
      status,
      referente_alten,
      referente_azienda,
      struttura,
      data,
      format,
      referente_sdg,
      to_do,
      next_steps,
      note,
      req.params.id
    );
    await logAction({
      user_id: req.user.id,
      action: "edit",
      entity: "appointment",
      entity_id: req.params.id,
      details: req.body
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Errore durante l'aggiornamento dell'appuntamento." });
  }
});

export default router;