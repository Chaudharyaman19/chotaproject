import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function sign(id: string, role: string) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
}

export async function register(req: AuthRequest, res: Response) {
  const data = registerSchema.parse(req.body);
  const exists = await User.findOne({ email: data.email.toLowerCase() });
  if (exists) return res.status(400).json({ message: 'Email already registered' });
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await User.create({ name: data.name, email: data.email.toLowerCase(), passwordHash, role: 'CUSTOMER' });
  const token = sign(user.id, user.role);
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

export async function login(req: AuthRequest, res: Response) {
  const data = loginSchema.parse(req.body);
  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(data.password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = sign(user.id, user.role);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

export async function me(req: AuthRequest, res: Response) {
  const user = await User.findById(req.user!.id).select('_id name email role');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
