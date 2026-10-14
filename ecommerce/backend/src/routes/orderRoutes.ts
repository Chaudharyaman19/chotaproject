import { Router } from 'express';
import { allOrders, cancelOrder, createOrder, myOrders, updateStatus } from '../controllers/orderController';
import { adminOnly, auth } from '../middleware/auth';

const r = Router();
r.post('/', auth(), createOrder);
r.get('/my', auth(), myOrders);
r.get('/', auth(), adminOnly, allOrders);
r.patch('/:id/status', auth(), adminOnly, updateStatus);
r.patch('/:id/cancel', auth(), cancelOrder);
export default r;
