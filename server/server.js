import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointments.js";
import companiesRouter from "./routes/companies.js";
import SDGGroupRouter from "./routes/SDG_group.js";
import appointmentSdgGroupRouter from "./routes/appointment_sdg_group.js";
import db from "./models/db.js";
import { authLimiter, apiLimiter } from "./middleware/rateLimiter.js";
import keyPeopleRouter from "./routes/key_people.js";
import appointmentKeyPersonRouter from "./routes/appointment_key_person.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

db.get("SELECT 1", [], (err, row) => {
  if (err) {
    console.error("Database connection failed!", err);
  } else {
    console.log("Database connection OK");
  }
});

// Apply authLimiter to login and register routes
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);

// Apply apiLimiter to all other API routes (optional, or per-router)
app.use("/api/appointments", apiLimiter);
app.use("/api/companies", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/companies", companiesRouter);
app.use("/api/sdg-group", SDGGroupRouter);
app.use("/api/appointment-sdg-group", appointmentSdgGroupRouter);
app.use("/api/key-people", keyPeopleRouter);
app.use("/api/appointment-key-person", appointmentKeyPersonRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));