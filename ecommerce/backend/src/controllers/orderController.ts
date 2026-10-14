import { Response } from 'express';
import { z } from 'zod';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';

const checkoutSchema = z.object({
  customerName: z.string().min(2).max(80),
  phone: z.string().min(7).max(20),
  shippingAddress: z.string().min(5).max(500),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(20) })).min(1),
});

function orderNumber() {
  return `ORD-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function createOrder(req: AuthRequest, res: Response) {
  const data = checkoutSchema.parse(req.body);
  let subtotal = 0;
  const items = [];
  for (const it of data.items) {
    const p = await Product.findById(it.productId);
    if (!p || !p.isActive) return res.status(400).json({ message: `Product unavailable` });
    if (p.stock < it.quantity) return res.status(400).json({ message: `Not enough stock for ${p.name}` });
    subtotal += p.price * it.quantity;
    items.push({ product: p._id, name: p.name, price: p.price, quantity: it.quantity });
    p.stock -= it.quantity;
    await p.save();
  }
  const order = await Order.create({
    orderNumber: orderNumber(),
    user: req.user!.id,
    items,
    customerName: data.customerName,
    phone: data.phone,
    shippingAddress: data.shippingAddress,
    subtotal,
    total: subtotal,
    paymentMethod: 'COD',
    paymentStatus: 'UNPAID',
    status: 'PENDING',
  });
  res.status(201).json(order);
}

export async function myOrders(req: AuthRequest, res: Response) {
  const orders = await Order.find({ user: req.user!.id }).sort({ createdAt: -1 });
  res.json({ orders });
}

export async function allOrders(_req: AuthRequest, res: Response) {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(200).populate('user', 'name email');
  const totalRevenue = orders.filter((o) => o.status !== 'CANCELLED').reduce((s, o) => s + o.total, 0);
  res.json({ orders, totalRevenue, totalOrders: orders.length });
}

export async function updateStatus(req: AuthRequest, res: Response) {
  const schema = z.object({ status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']) });
  const { status } = schema.parse(req.body);
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status === 'DELIVERED' || order.status === 'CANCELLED')
    return res.status(400).json({ message: 'Cannot change final order' });
  if (status === 'CANCELLED') {
    for (const it of order.items) {
      await Product.findByIdAndUpdate(it.product, { $inc: { stock: it.quantity } });
    }
  }
  order.status = status;
  await order.save();
  res.json(order);
}

export async function cancelOrder(req: AuthRequest, res: Response) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user!.id });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status !== 'PENDING') return res.status(400).json({ message: 'Only pending orders can be cancelled' });
  for (const it of order.items) {
    await Product.findByIdAndUpdate(it.product, { $inc: { stock: it.quantity } });
  }
  order.status = 'CANCELLED';
  await order.save();
  res.json(order);
}
