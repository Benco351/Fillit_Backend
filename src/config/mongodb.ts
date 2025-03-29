import mongoose from 'mongoose';

  export const connectMongoDB = async (): Promise<void> => {
    try {
      await mongoose.connect(process.env.MONGODB_URI as string);
      console.log('MongoDB connected successfully.');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  };