import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Product } from '../models/Product';

const IMG = (id: string) => `https://images.unsplash.com/${id}?w=600&q=80&auto=format&fit=crop`;
const products = [
  { name: 'Classic White T-Shirt', description: 'Premium cotton t-shirt', price: 19.99, image: IMG('photo-1521572163474-6864f9cf17ab'), category: 'Clothing', stock: 50 },
  { name: 'Denim Jacket', description: 'Stylish denim jacket', price: 59.99, image: IMG('photo-1551537482-f2075a1d41f2'), category: 'Clothing', stock: 30 },
  { name: 'Running Shoes', description: 'Lightweight running shoes', price: 89.99, image: IMG('photo-1542291026-7eec264c27ff'), category: 'Footwear', stock: 25 },
  { name: 'Leather Wallet', description: 'Genuine leather wallet', price: 34.99, image: IMG('photo-1627123424574-724758594e93'), category: 'Accessories', stock: 60 },
  { name: 'Smart Watch', description: 'Fitness smart watch', price: 149.99, image: IMG('photo-1523275335684-37898b6baf30'), category: 'Electronics', stock: 20 },
  { name: 'Wireless Headphones', description: 'Noise cancelling headphones', price: 99.99, image: IMG('photo-1505740420928-5e560c06d30e'), category: 'Electronics', stock: 35 },
  { name: 'Sunglasses', description: 'UV protection sunglasses', price: 29.99, image: IMG('photo-1572635196237-14b3f281503f'), category: 'Accessories', stock: 40 },
  { name: 'Backpack', description: 'Durable travel backpack', price: 49.99, image: IMG('photo-1553062407-98eeb64c6a62'), category: 'Accessories', stock: 45 },
  { name: 'Hoodie', description: 'Warm fleece hoodie', price: 39.99, image: IMG('photo-1556821840-3a63f95609a7'), category: 'Clothing', stock: 55 },
  { name: 'Sneakers', description: 'Casual everyday sneakers', price: 69.99, image: IMG('photo-1549298916-b41d501d3772'), category: 'Footwear', stock: 30 },
  { name: 'Laptop Stand', description: 'Aluminum laptop stand', price: 24.99, image: IMG('photo-1527864550417-7fd91fc51a46'), category: 'Electronics', stock: 50 },
  { name: 'Coffee Mug', description: 'Ceramic coffee mug', price: 12.99, image: IMG('photo-1514228742587-6b1558fcca3d'), category: 'Accessories', stock: 100 },
  { name: 'Jeans', description: 'Slim fit jeans', price: 44.99, image: IMG('photo-1542272604-787c3835535d'), category: 'Clothing', stock: 40 },
  { name: 'Sports Cap', description: 'Adjustable sports cap', price: 16.99, image: IMG('photo-1588850561407-ed78c282e89b'), category: 'Accessories', stock: 70 },
  { name: 'Bluetooth Speaker', description: 'Portable speaker', price: 54.99, image: IMG('photo-1608043152269-423dbba4e7e1'), category: 'Electronics', stock: 25 },
  { name: 'Formal Shoes', description: 'Leather formal shoes', price: 79.99, image: IMG('photo-1614252235316-8c857d38b5f4'), category: 'Footwear', stock: 20 },
  { name: 'Tote Bag', description: 'Canvas tote bag', price: 18.99, image: IMG('photo-1590874103328-eac38a683ce7'), category: 'Accessories', stock: 80 },
  { name: 'Polo Shirt', description: 'Classic polo shirt', price: 27.99, image: IMG('photo-1586790170083-2f9ceadc732d'), category: 'Clothing', stock: 60 },
  { name: 'Sandals', description: 'Comfortable sandals', price: 22.99, image: IMG('photo-1603487742131-4160ec999306'), category: 'Footwear', stock: 45 },
  { name: 'Keyboard', description: 'Mechanical keyboard', price: 74.99, image: IMG('photo-1587829741301-dc798b83add3'), category: 'Electronics', stock: 30 },
];

async function main() {
  await connectDB(process.env.MONGODB_URI || '');
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || 'Admin123!';
  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({ name: 'Admin', email: adminEmail, passwordHash: await bcrypt.hash(adminPass, 10), role: 'ADMIN' });
    console.log('Admin created:', adminEmail);
  }
  const samples = [['Ali Khan', 'ali@example.com'], ['Sara Ahmed', 'sara@example.com'], ['Usman Raza', 'usman@example.com']];
  for (const [name, email] of samples) {
    if (!(await User.findOne({ email }))) {
      await User.create({ name, email, passwordHash: await bcrypt.hash('Customer123!', 10), role: 'CUSTOMER' });
    }
  }
  for (const p of products) {
    await Product.updateOne({ name: p.name }, { $setOnInsert: { ...p, isActive: true } }, { upsert: true });
  }
  console.log('Seed done: 20 products, users ready');
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
