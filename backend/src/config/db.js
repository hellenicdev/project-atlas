import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

mongoose.set('sanitizeFilter', true);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
