import { Router } from "express";
import pool from "../models/db.js";
const router = Router();

router.get("/alten-appuntamenti", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        c.settore,
        COUNT(1) as count
      FROM 
        appuntamenti a 
        JOIN trattative t ON a.id_trattativa = t.id
        JOIN clienti c ON t.id_cliente = c.id
        JOIN appuntamenti_alten aa ON a.id = aa.id_appuntamento
        JOIN alten alt ON aa.id_alten = alt.id
      GROUP BY
        c.settore
      ORDER BY count DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;