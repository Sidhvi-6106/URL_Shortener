import dotenv from "dotenv";
dotenv.config();

import express from "express"; // Ensuring express is available if needed
import cors from 'cors';       // Moved and converted to ES Module import
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const requiredEnv = ["MONGO_URI", "JWT_SECRET", "BASE_URL"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

await connectDB();

// CORS configuration should ideally be placed BEFORE your routes are initialized, 
// but since 'app' is imported from app.js, we apply it here:
app.use(cors({
    origin: 'https://url-shortener-rose-one.vercel.app', // Your Vercel URL
    credentials: true
}));

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server closed");
  });
});