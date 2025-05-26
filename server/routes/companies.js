import express from "express";
import db from "../models/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { logAction } from "../utils/logAction.js";

const router = express.Router();

router.use(authenticateToken);

// Get all companies
router.get("/", async (req, res) => {
  const companies = await db.all("SELECT * FROM companies");
  res.json(companies);
});

// Add a new company
router.post("/", async (req, res) => {
  const {
    compagnia,
    settore,
    gruppo,
    ramo,
    capitale_sociale,
    sede,
    key_people,
    sito_web
  } = req.body;
  try {
    const stmt = await db.run(
      `INSERT INTO companies (compagnia, settore, gruppo, ramo, capitale_sociale, sede, key_people, sito_web)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      compagnia, settore, gruppo, ramo, capitale_sociale, sede, key_people, sito_web
    );
    await logAction({
      user_id: req.user.id,
      action: "add",
      entity: "company",
      entity_id: stmt.lastID,
      details: req.body
    });
    res.json({ id: stmt.lastID });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT") {
      res.status(400).json({ error: "Questa compagnia e settore esistono già." });
    } else {
      res.status(500).json({ error: "Errore del server." });
    }
  }
});

// Edit a company
router.put("/:id", async (req, res) => {
  const {
    compagnia,
    settore,
    gruppo,
    ramo,
    capitale_sociale,
    sede,
    key_people,
    sito_web
  } = req.body;
  try {
    const result = await db.run(
      `UPDATE companies SET
         compagnia = ?,
         settore = ?,
         gruppo = ?,
         ramo = ?,
         capitale_sociale = ?,
         sede = ?,
         key_people = ?,
         sito_web = ?
       WHERE id = ?`,
      compagnia, settore, gruppo, ramo, capitale_sociale, sede, key_people, sito_web, req.params.id
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    await logAction({
      user_id: req.user.id,
      action: "edit",
      entity: "company",
      entity_id: req.params.id,
      details: req.body
    });
    res.json({ id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Errore del server." });
  }
});

export default router;