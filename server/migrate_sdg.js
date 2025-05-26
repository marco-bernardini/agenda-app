import db from "./models/db.js";

// Get all appointments
const appointments = await db.all("SELECT id, referente_sdg FROM appointments");

function splitNominativi(str) {
  if (!str) return [];
  // Remove extra spaces and split by space
  const words = str.trim().split(/\s+/);
  const nominativi = [];
  for (let i = 0; i < words.length; i += 2) {
    // Join every two words as a nominativo
    if (words[i + 1]) {
      nominativi.push(`${words[i]} ${words[i + 1]}`);
    }
  }
  return nominativi;
}

for (const appt of appointments) {
  if (!appt.referente_sdg) continue;
  const nominativi = splitNominativi(appt.referente_sdg);

  for (const nominativo of nominativi) {
    // Find SDG_group id
    const sdg = await db.get("SELECT id FROM SDG_group WHERE nominativo = ?", nominativo);
    if (sdg) {
      await db.run(
        "INSERT OR IGNORE INTO appointment_sdg_group (appointment_id, sdg_group_id) VALUES (?, ?)",
        appt.id,
        sdg.id
      );
      console.log(`Linked appointment ${appt.id} to SDG_group ${sdg.id} (${nominativo})`);
    } else {
      console.warn(`SDG_group not found for nominativo: ${nominativo}`);
    }
  }
}

process.exit(0);