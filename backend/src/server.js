import dotenv from "dotenv";
dotenv.config();

import app from "./app.js"; 
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const requiredEnv = ["MONGO_URI", "JWT_SECRET", "BASE_URL"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
const hasClientOrigin = Boolean(process.env.CLIENT_URL || process.env.CLIENT_URLS);

if (!hasClientOrigin) {
  missingEnv.push("CLIENT_URL or CLIENT_URLS");
}

if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

try {
  console.log("Environment check passed. Initializing setup...");

  // 1. Check Database connection phase
  console.log("Attempting to connect to MongoDB...");
  await connectDB();
  console.log("MongoDB Connection promise resolved successfully!");

  // 2. Check Server binding phase
  console.log(`Attempting to bind Express to port ${PORT}...`);
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 SUCCESS: Server permanently listening on port ${PORT}`);
  });

  process.on("unhandledRejection", (error) => {
    console.error("💥 Unhandled Rejection Caught:", error);
    if (server && typeof server.close === "function") {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received. Shutting down cleanly...");
    if (server && typeof server.close === "function") {
      server.close(() => console.log("Server closed"));
    }
  });
} catch (error) {
  console.error("❌ CRITICAL STARTUP ERROR:");
  console.error("Error Name:", error?.name || "UnknownError");
  console.error("Error Message:", error?.message || error);

  if (error?.stack) {
    console.error("Error Stack Trace:\n", error.stack);
  }
  process.exit(1);
}