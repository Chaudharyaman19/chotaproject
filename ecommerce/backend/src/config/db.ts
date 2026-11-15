import mongoose from 'mongoose';
import { logger } from './logger';

export async function connectDB(uri: string) {
  if (!uri) throw new Error('MONGODB_URI is missing');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000, maxPoolSize: 20 });
  logger.info('MongoDB connected');
}
