import db from "../models/db.js";

export async function logAction({ user_id, action, entity, entity_id, details }) {
  await db.run(
    `INSERT INTO logs (user_id, action, entity, entity_id, details)
     VALUES (?, ?, ?, ?, ?)`,
    user_id,
    action,
    entity,
    entity_id,
    details ? JSON.stringify(details) : null
  );
}