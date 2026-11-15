import { Router } from 'express';
import { login, me, register } from '../controllers/authController';
import { auth } from '../middleware/auth';
import { loginLimiter } from '../middleware/rateLimit';
import { asyncHandler } from '../utils/asyncHandler';

const r = Router();
r.post('/register', asyncHandler(register));
r.post('/login', loginLimiter, asyncHandler(login));
r.get('/me', auth(), asyncHandler(me));
export default r;
