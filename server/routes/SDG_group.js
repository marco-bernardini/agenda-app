import express from "express";
import db from "../models/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

// Get all SDG_group entries
router.get("/", async (req, res) => {
  try {
    const groups = await db.all("SELECT * FROM SDG_group");
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero dei gruppi SDG." });
  }
});

// Add a new SDG_group entry
router.post("/", async (req, res) => {
  const { nominativo, business_unit } = req.body;
  if (!nominativo || !business_unit) {
    return res.status(400).json({ error: "nominativo e business_unit sono obbligatori." });
  }
  try {
    const stmt = await db.run(
      "INSERT INTO SDG_group (nominativo, business_unit) VALUES (?, ?)",
      nominativo,
      business_unit
    );
    res.json({ id: stmt.lastID });
  } catch (err) {
    res.status(500).json({ error: "Errore nell'inserimento del gruppo SDG." });
  }
});

// Delete an SDG_group entry by id
router.delete("/:id", async (req, res) => {
  try {
    await db.run("DELETE FROM SDG_group WHERE id = ?", req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Errore nell'eliminazione del gruppo SDG." });
  }
});

export default router;