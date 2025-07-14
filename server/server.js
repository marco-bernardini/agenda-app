import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appuntamenti.js";
import clientiRouter from "./routes/clienti.js";
import SDGGroupRouter from "./routes/SDG_group.js";
import appuntamentiSdgGroupRouter from "./routes/appuntamenti_SDG_group.js";
import altenRouter from "./routes/alten.js";
import appuntamentiAltenRouter from "./routes/appuntamenti_alten.js";
import keyPeopleRouter from "./routes/key_people.js";
import appuntamentiKeyPeopleRouter from "./routes/appuntamenti_key_people.js";
import trattativeRouter from "./routes/trattative.js";
import taskRouter from "./routes/task.js";
import metricsRouter from "./routes/metrics.js";
import chatRouter from "./routes/chat.js";
import statsRouter from "./routes/stats.js";
import { authLimiter, apiLimiter } from "./middleware/rateLimiter.js";
import pool from "./models/db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Test PostgreSQL connection
pool
  .query("SELECT 1")
  .then(() => {
    console.log("Database connection OK");
  })
  .catch((err) => {
    console.error("Database connection failed!", err);
  });

// Apply authLimiter to login and register routes
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);

// Apply apiLimiter to all other API routes (optional, or per-router)
app.use("/api/appuntamenti", apiLimiter);
app.use("/api/clienti", apiLimiter);

// Main API routes
app.use("/api/auth", authRoutes);
app.use("/api/appuntamenti", appointmentRoutes);
app.use("/api/clienti", clientiRouter);
app.use("/api/sdg-group", SDGGroupRouter);
app.use("/api/appuntamenti-sdg-group", appuntamentiSdgGroupRouter);
app.use("/api/alten", altenRouter);
app.use("/api/appuntamenti-alten", appuntamentiAltenRouter);
app.use("/api/key-people", keyPeopleRouter);
app.use("/api/appuntamenti-key-people", appuntamentiKeyPeopleRouter);
app.use("/api/trattative", trattativeRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/metrics", metricsRouter);
app.use("/api", chatRouter);
app.use("/api/stats", statsRouter);

// Verify the chat router is mounted
console.log("🚀 Routes mounted:");
console.log("- /api/chat (Chat API)");
// ... list other routes if needed

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
