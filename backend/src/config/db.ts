import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    // In demo, fallback to a local MongoDB if no URI is provided
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/simple-lms-demo';
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};
