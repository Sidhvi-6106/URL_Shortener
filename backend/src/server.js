import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;
const cors = require('cors');

const requiredEnv = ["MONGO_URI", "JWT_SECRET", "BASE_URL"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

await connectDB();

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
app.use(cors({
    origin: 'https://url-shortener-rose-one.vercel.app', // Your Vercel URL
    credentials: true
}));

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server closed");
  });
});
