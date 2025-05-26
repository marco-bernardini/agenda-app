import express from "express";
import db from "../models/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { logAction } from "../utils/logAction.js";

const router = express.Router();

router.use(authenticateToken);

// Add a new key person
router.post("/", async (req, res) => {
  const { nome, cognome, id_compagnia, ruolo, linkedIn } = req.body;
  if (!nome || !cognome || !id_compagnia) {
    return res.status(400).json({ error: "nome, cognome e id_compagnia sono obbligatori." });
  }
  try {
    const stmt = await db.run(
      "INSERT INTO key_people (nome, cognome, id_compagnia, ruolo, linkedIn) VALUES (?, ?, ?, ?, ?)",
      nome,
      cognome,
      id_compagnia,
      ruolo || null,
      linkedIn || null
    );

    // Log the action
    await logAction({
      user_id: req.user.id,
      action: "add",
      entity: "key_person",
      entity_id: stmt.lastID,
      details: req.body
    });

    res.json({ id: stmt.lastID });
  } catch (err) {
    res.status(500).json({ error: "Errore nell'inserimento della key person." });
  }
});

// (Optional) Get all key people
router.get("/", async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM key_people");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero delle key people." });
  }
});

export default router;