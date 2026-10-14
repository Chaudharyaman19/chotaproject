import { Request, Response } from 'express';
import { z } from 'zod';
import { Product } from '../models/Product';

const productSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(5).max(2000),
  price: z.number().nonnegative(),
  image: z.string().url(),
  category: z.string().min(2).max(60),
  stock: z.number().int().min(0),
  isActive: z.boolean().optional(),
});

export async function listProducts(req: Request, res: Response) {
  const { search = '', category = '', sort = '', } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = { isActive: true };
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (category) filter.category = category;
  let query = Product.find(filter);
  if (sort === 'price-asc') query = query.sort({ price: 1 });
  if (sort === 'price-desc') query = query.sort({ price: -1 });
  const products = await query.limit(100);
  const categories = await Product.distinct('category', { isActive: true });
  res.json({ products, categories });
}

export async function getProduct(req: Request, res: Response) {
  const p = await Product.findById(req.params.id);
  if (!p || !p.isActive) return res.status(404).json({ message: 'Product not found' });
  res.json(p);
}

export async function createProduct(req: Request, res: Response) {
  const data = productSchema.parse(req.body);
  const p = await Product.create(data);
  res.status(201).json(p);
}

export async function updateProduct(req: Request, res: Response) {
  const data = productSchema.partial().parse(req.body);
  const p = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json(p);
}

export async function deleteProduct(req: Request, res: Response) {
  const p = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
}

export async function adminListProducts(_req: Request, res: Response) {
  const products = await Product.find().sort({ createdAt: -1 }).limit(200);
  res.json({ products });
}
