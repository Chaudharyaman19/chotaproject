import { Request, Response } from 'express';
import { z } from 'zod';
import { Message } from '../models/Message';
import { Order } from '../models/Order';
import { User } from '../models/User';

/** Public: newsletter signup + contact form share one collection (see Message model). */
const contactSchema = z.object({
  kind: z.enum(['CONTACT', 'NEWSLETTER']),
  email: z.string().email().max(120),
  name: z.string().min(2).max(80).optional(),
  subject: z.string().max(120).optional(),
  message: z.string().min(5).max(3000).optional(),
});

export async function submitMessage(req: Request, res: Response) {
  const data = contactSchema.parse(req.body);
  if (data.kind === 'CONTACT' && (!data.name || !data.message)) {
    return res.status(400).json({ message: 'Name and message are required' });
  }
  if (data.kind === 'NEWSLETTER') {
    // Idempotent: subscribing twice is not an error and doesn't create duplicates.
    await Message.updateOne({ kind: 'NEWSLETTER', email: data.email.toLowerCase() }, { $setOnInsert: { kind: 'NEWSLETTER', email: data.email } }, { upsert: true });
    return res.status(201).json({ ok: true });
  }
  await Message.create(data);
  res.status(201).json({ ok: true });
}

/** Admin: inbox (contact messages + subscribers). */
export async function listMessages(_req: Request, res: Response) {
  const messages = await Message.find().sort({ createdAt: -1 }).limit(500);
  res.json({ messages });
}

export async function setMessageHandled(req: Request, res: Response) {
  const { handled } = z.object({ handled: z.boolean() }).parse(req.body);
  const m = await Message.findByIdAndUpdate(req.params.id, { handled }, { new: true });
  if (!m) return res.status(404).json({ message: 'Message not found' });
  res.json(m);
}

/** Admin: customers with order count + lifetime spend (cancelled orders excluded from spend). */
export async function listCustomers(_req: Request, res: Response) {
  const [users, stats] = await Promise.all([
    User.find().sort({ createdAt: -1 }).limit(1000).select('_id name email role createdAt'),
    Order.aggregate([
      {
        $group: {
          _id: '$user',
          orders: { $sum: 1 },
          spent: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 0, '$total'] } },
          lastOrderAt: { $max: '$createdAt' },
        },
      },
    ]),
  ]);
  const byUser = new Map(stats.map((s) => [String(s._id), s]));
  const customers = users.map((u) => {
    const s = byUser.get(String(u._id));
    return { _id: u._id, name: u.name, email: u.email, role: u.role, createdAt: (u as unknown as { createdAt: Date }).createdAt, orders: s?.orders ?? 0, spent: s?.spent ?? 0, lastOrderAt: s?.lastOrderAt ?? null };
  });
  res.json({ customers });
}
