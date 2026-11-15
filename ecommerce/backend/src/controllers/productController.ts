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
  brand: z.string().max(60).optional(),
  sku: z.string().max(40).optional(),
  compareAtPrice: z.number().nonnegative().nullable().optional(),
  rating: z.number().min(0).max(5).optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string().max(30)).max(12).optional(),
  images: z.array(z.string().url()).max(10).optional(),
});

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTS: Record<string, Record<string, 1 | -1>> = {
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  newest: { createdAt: -1 },
  rating: { rating: -1, createdAt: -1 },
};

export async function listProducts(req: Request, res: Response) {
  const { search = '', category = '', sort = '', featured = '', inStock = '', minPrice = '', maxPrice = '', limit = '' } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = { isActive: true };
  // Escape regex metacharacters: raw user input in $regex would throw on "(" and could be
  // abused with catastrophic patterns (ReDoS). Cap the length too.
  if (search) {
    const rx = { $regex: escapeRegex(search.slice(0, 60)), $options: 'i' };
    filter.$or = [{ name: rx }, { brand: rx }, { category: rx }, { tags: rx }];
  }
  if (category) filter.category = category;
  if (featured === 'true') filter.featured = true;
  if (inStock === 'true') filter.stock = { $gt: 0 };
  const min = Number(minPrice);
  const max = Number(maxPrice);
  if (minPrice !== '' || maxPrice !== '') {
    filter.price = {
      ...(Number.isFinite(min) && minPrice !== '' ? { $gte: min } : {}),
      ...(Number.isFinite(max) && maxPrice !== '' ? { $lte: max } : {}),
    };
  }
  const cap = Math.min(Math.max(parseInt(limit, 10) || 200, 1), 500);
  const products = await Product.find(filter).sort(SORTS[sort] ?? { featured: -1, createdAt: -1 }).limit(cap);
  const categories = await Product.distinct('category', { isActive: true });
  res.json({ products, categories: categories.sort(), total: products.length });
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

/** Soft delete: order history keeps referencing the product, it just disappears from the shop. */
export async function deleteProduct(req: Request, res: Response) {
  const p = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
}

export async function adminListProducts(_req: Request, res: Response) {
  const products = await Product.find().sort({ createdAt: -1 }).limit(1000);
  res.json({ products });
}
