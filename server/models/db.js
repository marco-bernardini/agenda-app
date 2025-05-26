import sqlite3 from "sqlite3";
import { open } from "sqlite";

const dbPromise = open({
  filename: "./db/database.sqlite",
  driver: sqlite3.Database,
});

const db = await dbPromise;

// Init tables
await db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
);

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  cliente TEXT,
  status TEXT,
  referente_alten TEXT,
  referente_azienda TEXT,
  struttura TEXT,
  data TEXT,
  format TEXT,
  referente_sdg TEXT,
  to_do TEXT,
  next_steps TEXT,
  note TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  compagnia TEXT,
  settore TEXT,
  gruppo TEXT,
  ramo TEXT,
  capitale_sociale TEXT,
  sede TEXT,
  key_people TEXT,
  sito_web TEXT,
  UNIQUE(compagnia, settore)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_compagnia_settore ON companies(compagnia, settore);

CREATE TABLE IF NOT EXISTS SDG_group (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nominativo TEXT NOT NULL,
  business_unit TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS key_people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  id_compagnia INTEGER NOT NULL,
  ruolo TEXT,
  linkedIn TEXT,
  FOREIGN KEY (id_compagnia) REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  details TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`);

export default db;