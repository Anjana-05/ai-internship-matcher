// config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv'; // Ensure dotenv is imported

dotenv.config(); // Ensure environment variables are loaded

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI not defined in .env");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${process.env.MONGODB_URI}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
