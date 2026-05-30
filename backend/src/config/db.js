import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI?.trim();

  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured");
  }

  const conn = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

export default connectDB;
