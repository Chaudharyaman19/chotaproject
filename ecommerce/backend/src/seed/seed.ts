import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import catalog from './catalog.json';

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

/** ~45 backdated orders over the last 30 days so the admin charts have something to show. */
async function seedDemoOrders() {
  if (await Order.countDocuments({ orderNumber: /^DEMO-/ })) return console.log('Demo orders already present, skipping');
  const customers = await User.find({ role: 'CUSTOMER' }).limit(10);
  const prods = await Product.find({ isActive: true, stock: { $gt: 5 } }).limit(60);
  if (!customers.length || !prods.length) return;
  const statuses = ['DELIVERED', 'DELIVERED', 'DELIVERED', 'SHIPPED', 'CONFIRMED', 'PENDING', 'CANCELLED'] as const;
  const docs = Array.from({ length: 45 }, (_, i) => {
    const c = customers[i % customers.length];
    const lines = Array.from({ length: 1 + (i % 3) }, (_, k) => prods[(i * 7 + k * 3) % prods.length]);
    const items = lines.map((p, k) => ({ product: p._id, name: p.name, price: p.price, quantity: 1 + ((i + k) % 2) }));
    const subtotal = Math.round(items.reduce((s, it) => s + it.price * it.quantity, 0) * 100) / 100;
    const when = new Date(Date.now() - ((i * 17) % 30) * 86400000 - (i % 9) * 3600000);
    return {
      orderNumber: `DEMO-${String(i + 1).padStart(4, '0')}`, user: c._id, items,
      customerName: c.name, phone: '0300 1234567', shippingAddress: `${10 + i} Demo Street, Lahore`,
      subtotal, total: subtotal, paymentMethod: 'COD', paymentStatus: 'UNPAID',
      status: statuses[i % statuses.length], createdAt: when, updatedAt: when,
    };
  });
  await Order.collection.insertMany(docs); // raw insert: keeps the backdated timestamps
  console.log(`Demo orders created: ${docs.length}`);
}

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
  // Additive on purpose: $setOnInsert never overwrites a product an admin already edited,
  // so re-running the seed on a live database is safe.
  for (const p of [...products, ...(catalog as Record<string, unknown>[])] as Array<{ name: string }>) {
    await Product.updateOne({ name: p.name }, { $setOnInsert: { ...p, isActive: true } }, { upsert: true });
  }
  console.log(`Seed done: ${await Product.countDocuments()} products in catalogue, users ready`);

  // Opt-in demo history for dashboards/screenshots: `npm run seed -- --demo-orders`. Never run by default.
  if (process.argv.includes('--demo-orders')) await seedDemoOrders();
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
