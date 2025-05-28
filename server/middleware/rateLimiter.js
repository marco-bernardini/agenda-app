import rateLimit from "express-rate-limit";

// Limit for login and register: 5 requests per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Troppi tentativi, riprova tra 15 minuti.",
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter: 100 requests per 30 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 100,
  message: "Troppi tentativi, riprova tra 30 minuti.",
  standardHeaders: true,
  legacyHeaders: false,
});