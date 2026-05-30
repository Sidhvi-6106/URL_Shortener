import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import urlRoutes from "./routes/urlRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import sanitizeInput from "./middleware/sanitizeInput.js";
import { redirectToOriginalUrl } from "./controllers/urlController.js";

const app = express();

// Use the dynamic environment variable BASE_URL with a fallback to your current active Render URL
const API_BASE_URL = process.env.BASE_URL || "https://url-shortener-19le.onrender.com";

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(sanitizeInput);
app.use(apiLimiter);

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API healthy",
  });
});

// Base Route
app.get("/", (req, res) => {
  res.send("API Running...");
});

// Main API Routes
app.use("/api/url", urlRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);

// Redirect Routes
app.get("/r/:shortCode", redirectToOriginalUrl);
app.get("/:shortCode", redirectToOriginalUrl);

// 404 Catch-all Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Middleware
app.use(errorMiddleware);

export default app;