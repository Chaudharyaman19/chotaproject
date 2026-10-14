import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import { connectDB } from './config/db';

const PORT = Number(process.env.PORT || 5000);
connectDB(process.env.MONGODB_URI || '').then(() => {
  app.listen(PORT, () => console.log(`Backend running on :${PORT}`));
}).catch((e) => { console.error(e); process.exit(1); });
