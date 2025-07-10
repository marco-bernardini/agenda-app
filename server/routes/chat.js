import express from "express";
import { OpenAI } from "openai";
import pool from "../models/db.js"; // Change this line (was "../db.js")

// placeholder
const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Compact schema (copy from your DB_structure.txt, remove comments/quotes)
const schema = `
alten:
id, nominativo, business_unit

appuntamenti:
id, esito (text), data, format, note, id_trattativa (→ trattative.id)

appuntamenti_alten (join table):
id_appuntamento (→ appuntamenti.id), id_alten (→ alten.id)

appuntamenti_key_people (join table):
id_appuntamento (→ appuntamenti.id), id_person (→ key_people.id)

appuntamenti_sdg_group (join table):
id_appuntamento (→ appuntamenti.id), id_sdg (→ sdg_group.id)

clienti:
id, denominazione_cliente, settore (text)

key_people:
id, nome, cognome, id_cliente (→ clienti.id), ruolo, linkedin

sdg_group:
id, nominativo, business_unit (text), email

task:
id, descrizione, id_appuntamento (→ appuntamenti.id), status (text), id_sdg (→ sdg_group.id)

trattative:
id, id_cliente (→ clienti.id), status (text), struttura, note, denominazione, owner (text: Alten, SDG, etc..)
`;

router.post("/chat", async (req, res) => {
  const { question, history } = req.body;

  // Build conversation memory for OpenAI
  const memoryMessages = [
    {
      role: "system",
      content: `You are an SQL assistant that translates natural language questions about a CRM database into SQL queries and then explains the results in natural language.

  Schema:
  ${schema}

  When dealing with company names, always use ILIKE with wildcards for partial matches (e.g., '%Cardif%' would match 'BNP PARIBAS CARDIF VITA' regardless of case).

  Always join appuntamenti with trattative and clienti to include customer names in results, get owners and dates.
  
  Examples:

  Q: Quali appuntamenti abbiamo fatto con Rossi nell'ultimo mese?
  A: {
    "sql": "SELECT
    c.denominazione_cliente,
    a.*
    FROM appuntamenti a
    LEFT JOIN appuntamenti_sdg_group asg ON a.id = asg.id_appuntamento
    LEFT JOIN sdg_group sdg ON asg.id_sdg = sdg.id
    LEFT JOIN appuntamenti_alten aa ON a.id = aa.id_appuntamento
    LEFT JOIN alten alt ON aa.id_alten = alt.id
    LEFT JOIN trattative t ON a.id_trattativa = t.id
    LEFT JOIN clienti c ON t.id_cliente = c.id
    LEFT JOIN appuntamenti_key_people akp ON a.id = akp.id_appuntamento
    LEFT JOIN key_people kp ON akp.id_person = kp.id
    WHERE (sdg.nominativo ILIKE '%Rossi%'
    OR alt.nominativo ILIKE '%Rossi%'
    OR c.denominazione_cliente ILIKE '%Rossi%'
    OR t.owner ILIKE '%Rossi%'
    OR kp.nome ILIKE '%Rossi%'
    OR kp.cognome ILIKE '%Rossi%')
    AND a.data >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
    AND a.data < date_trunc('month', CURRENT_DATE);",
    "explanation": "I'm checking all appointments we had with Marco Rossi from SDG Group or Alten in the last month."
  }

  Q: Quante iniziative con owner Alten abbiamo fatto nell'ultimo anno?
  A: {
    "sql": "SELECT COUNT(*)
     FROM (
       SELECT t.id, MAX(a.data) AS d
       FROM trattative t
       JOIN appuntamenti a ON t.id = a.id_trattativa
       WHERE t.owner LIKE '%Alten%'  -- also fixed incorrect LIKE usage
       GROUP BY t.id
     ) sub
    WHERE d >= date_trunc('year', CURRENT_DATE);",
    "explanation": "I'm counting all deals with owner Alten in the current year."
  }

  Q: Quali clienti ci devono ancora dare un feedback?
  A: {
      "sql": "SELECT 
      c.denominazione_cliente, 
      t.denominazione, 
      a.data, 
      a.esito
      FROM appuntamenti a
      JOIN trattative t ON a.id_trattativa = t.id
      JOIN clienti c ON t.id_cliente = c.id
      WHERE a.esito IN ('attesa feedback');",
    "explanation": "I'm checking all appointments with status feedback."
  }

  Q: Quali clienti dobbiamo risentire?
  A: {
      "sql": "SELECT 
      c.denominazione_cliente, 
      t.denominazione, 
      a.data, 
      a.esito
      FROM appuntamenti a
      JOIN trattative t ON a.id_trattativa = t.id
      JOIN clienti c ON t.id_cliente = c.id
      WHERE a.esito IN ('risentire');",
    "explanation": "I'm checking all appointments with status risentire."
  }

  Q: Quali task abbiamo in pending?
  A: {
      "sql": "SELECT 
      c.denominazione_cliente, 
      t.denominazione, 
      tsk.descrizione, 
      a.data AS data_appuntamento,
      sdg.nominativo AS owner_sdg
      FROM task tsk
      JOIN appuntamenti a ON tsk.id_appuntamento = a.id
      JOIN trattative t ON a.id_trattativa = t.id
      JOIN clienti c ON t.id_cliente = c.id
      LEFT JOIN sdg_group sdg ON tsk.id_sdg = sdg.id
      WHERE NOT tsk.status;",
    "explanation": "I'm checking all the uncompleted tasks."
  }

  Q: Quali appuntamenti dobbiamo fissare?
  A: {
    "sql":"SELECT 
    c.denominazione_cliente, 
    t.denominazione, 
    COALESCE( alt.nominativo, 'SDG' ) as owner,
    COALESCE( kp.nome || ' ' || kp.cognome, '' ) as key_person
    FROM trattative t
    LEFT JOIN appuntamenti a ON t.id = a.id_trattativa
    LEFT JOIN appuntamenti_key_people akp on a.id = akp.id_appuntamento
    LEFT JOIN key_people kp on akp.id_person = kp.id
    LEFT JOIN appuntamenti_alten aa on aa.id_appuntamento = a.id
    LEFT JOIN alten alt on aa.id_alten = alt.id
    LEFT JOIN clienti c ON t.id_cliente = c.id
    WHERE ( a.id IS NULL AND t.status = 'to start' ) OR EXTRACT( YEAR FROM a.data ) = 9999;",
  "explanation":"I'm checking the appointments with the placeholder date 31/12/9999 and the initiatives without appointments"
  }

  `,
    },
  ];

  // Always include the last two exchanges (user+bot, user+bot) if available
  if (Array.isArray(history) && history.length > 0) {
    // Get the last 4 messages (2 exchanges)
    const lastExchanges = history.slice(-4);
    lastExchanges.forEach((msg) => {
      memoryMessages.push({
        role: msg.from === "Utente" ? "user" : "assistant",
        content: msg.text,
      });
    });
    memoryMessages.push({ role: "user", content: question });
  } else {
    // Only send the current question
    memoryMessages.push({ role: "user", content: question });
  }

  try {
    console.log("📡 Calling OpenAI API...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: memoryMessages,
      temperature: 0,
    });

    console.log("✅ OpenAI API response received");
    const content = completion.choices[0].message.content;
    console.log("📝 OpenAI raw response:", content);

    // Extract SQL and explanation from response
    const sqlMatch = content.match(/"sql":\s*"([^"]+)"/);
    const explMatch = content.match(/"explanation":\s*"([^"]+)"/);

    if (!sqlMatch) {
      console.log("❌ Failed to extract SQL from response");
      return res
        .status(400)
        .json({ error: "No SQL found in GPT response", gpt: content });
    }

    const sql = sqlMatch[1];
    const explanation = explMatch ? explMatch[1] : "Query results:";
    console.log("🔍 Extracted SQL:", sql);

    // Basic safety check
    if (!sql.trim().toLowerCase().startsWith("select")) {
      console.log("⚠️ Unsafe SQL detected (not a SELECT)");
      return res.status(400).json({ error: "Unsafe SQL (not a SELECT)", sql });
    }

    console.log("🔍 Executing SQL query...");
    const { rows } = await pool.query(sql);
    console.log("✅ SQL query executed successfully, row count:", rows.length);

    // Call OpenAI again to explain the results in natural language
    const resultPrompt = `
      You are an assistant explaining database query results to users in natural language.

      Question: ${question}
      SQL Query: ${sql}
      Explanation: ${explanation}
      Query Results: ${JSON.stringify(rows)}

      Respond in Italian.

      Rules:
      1. Always include customer names (denominazione_cliente in clienti table) in the results, where applicable.
      2. Summarize abbreviating content if it exceeds 30 characters
      3. Do not include hours or ID numbers in the answers
      4. DO NOT mention SQL or queries in your response.
      5. format the response in Markdown with a table for results
      `;

    const resultCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: resultPrompt }],
      temperature: 0.7,
    });

    const naturalResponse = resultCompletion.choices[0].message.content;

    res.json({
      rows,
      sql,
      explanation,
      naturalResponse,
    });
  } catch (err) {
    console.error("❌ Error in chat endpoint:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
