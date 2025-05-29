import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import pool from "../models/db.js";

const router = express.Router();

router.use(authenticateToken);

// GET /appuntamenti?withDetails=1
router.get("/", async (req, res) => {
  try {
    if (req.query.withDetails === "1") {
      // Join with clienti and referente_alten (via appuntamenti_alten and alten)
      const { rows } = await pool.query(`
        SELECT 
          a.*,
          c.denominazione_cliente,
          c.id as id_cliente,
          c.settore AS cliente_settore,
          alt.nominativo AS referente_alten
        FROM appuntamenti a
        JOIN trattative t ON a.id_trattativa = t.id
        JOIN clienti c ON t.id_cliente = c.id
        LEFT JOIN appuntamenti_alten aa ON aa.id_appuntamento = a.id
        LEFT JOIN alten alt ON aa.id_alten = alt.id
        ORDER BY a.data DESC
      `);
      res.json(rows);
    } else {
      const { rows } = await pool.query("SELECT * FROM appuntamenti");
      res.json(rows);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appuntamenti" });
  }
});

// Add a new appointment
router.post("/", async (req, res) => {
  const {
    esito,
    data,
    format,
    to_do,
    next_steps,
    note,
    id_trattativa
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO appuntamenti 
        (esito, data, format, to_do, next_steps, note, id_trattativa)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [esito, data, format, to_do, next_steps, note, id_trattativa]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Errore nell'inserimento dell'appuntamento." });
  }
});

// Update an appointment (including esito and referente_alten)
router.put("/:id", async (req, res) => {
  const {
    esito,
    data,
    format,
    to_do,
    next_steps,
    note,
/*     referente_alten */
  } = req.body;
  try {
    // Update main fields
    await pool.query(
      `UPDATE appuntamenti SET
        esito = $1,
        data = $2,
        format = $3,
        to_do = $4,
        next_steps = $5,
        note = $6
       WHERE id = $7`,
      [esito, data, format, to_do, next_steps, note, req.params.id]
    );

/*     // Update referente_alten (in appuntamenti_alten)
    if (referente_alten !== undefined) {
      // Get alten.id for nominativo
      const { rows: altenRows } = await pool.query(
        "SELECT id FROM alten WHERE nominativo = $1",
        [referente_alten]
      );
      if (altenRows.length > 0) {
        const altenId = altenRows[0].id;
        // Remove existing links
        await pool.query(
          "DELETE FROM appuntamenti_alten WHERE id_appuntamento = $1",
          [req.params.id]
        );
        // Insert new link
        await pool.query(
          "INSERT INTO appuntamenti_alten (id_appuntamento, id_alten) VALUES ($1, $2)",
          [req.params.id, altenId]
        );
      }
    } */

    res.json({ id: req.params.id });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Errore durante l'aggiornamento dell'appuntamento." });
  }
});

export default router;