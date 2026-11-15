import { Router } from 'express';
import { allOrders, cancelOrder, createOrder, myOrders, updateStatus } from '../controllers/orderController';
import { adminOnly, auth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const r = Router();
r.post('/', auth(), asyncHandler(createOrder));
r.get('/my', auth(), asyncHandler(myOrders));
r.get('/', auth(), adminOnly, asyncHandler(allOrders));
r.patch('/:id/status', auth(), adminOnly, asyncHandler(updateStatus));
r.patch('/:id/cancel', auth(), asyncHandler(cancelOrder));
export default r;
