import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Force strict query rules off to prevent legacy Mongoose warnings
    mongoose.set('strictQuery', false);

    console.log("Connecting with URI:", process.env.MONGO_URI ? "URI detected (hidden for safety)" : "MISSING URI");

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These rules stop Node.js from hanging infinitely if a cloud routing lag occurs
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000,         
      family: 4                       // Forces IPv4, bypassing slow IPv6 DNS lookups on Render
    });

    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    // Print the full inner error to see if it's a specific SSL or handshaking issue
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    process.exit(1);
  }
};

export default connectDB;