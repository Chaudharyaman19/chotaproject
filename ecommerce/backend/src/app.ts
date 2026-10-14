import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();
app.use(cors({ origin: (process.env.FRONTEND_URL || 'http://localhost:3000').split(',') }));
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
