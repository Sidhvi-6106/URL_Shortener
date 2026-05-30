import dotenv from "dotenv";
dotenv.config();

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
  console.log("Environment check passed");

  const { default: app } = await import("./app.js");

  await connectDB();

  const server = app.listen(PORT, "0.0.0.0", () => {
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
} catch (error) {
  console.error("Startup Error Name:", error?.name || "UnknownError");
  console.error("Startup Error Code:", error?.code || "NO_CODE");
  console.error("Startup Error Message:", error?.message || error);

  if (error?.reason) {
    console.error("Startup Error Reason:", error.reason);
  }

  if (error?.stack) {
    console.error(error.stack);
  }

  process.exit(1);
}
