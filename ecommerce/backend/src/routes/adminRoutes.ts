import { Router } from 'express';
import { listCustomers, listMessages, setMessageHandled, submitMessage } from '../controllers/adminController';
import { adminOnly, auth } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { asyncHandler } from '../utils/asyncHandler';

const r = Router();

// Public form endpoint: tighter than the global limiter so it can't be used to flood the inbox.
const formLimiter = rateLimit({ keyPrefix: 'rl:form', points: 8, durationSec: 15 * 60, message: 'Too many submissions. Try again later.' });
r.post('/messages', formLimiter, asyncHandler(submitMessage));

r.get('/admin/customers', auth(), adminOnly, asyncHandler(listCustomers));
r.get('/admin/messages', auth(), adminOnly, asyncHandler(listMessages));
r.patch('/admin/messages/:id', auth(), adminOnly, asyncHandler(setMessageHandled));

export default r;
