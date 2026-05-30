import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI?.trim();

    if (!mongoUri) {
      throw new Error("MONGO_URI is not configured");
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
