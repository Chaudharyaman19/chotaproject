import mongoose, { Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  isActive: boolean;
  // Storefront / catalogue extras (all optional so old documents stay valid)
  brand?: string;
  sku?: string;
  compareAtPrice?: number; // "was" price, shown struck through when higher than `price`
  rating?: number; // 0-5
  featured: boolean;
  tags: string[];
  images: string[]; // gallery; `image` stays the primary / card image
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
    brand: { type: String, trim: true, maxlength: 60 },
    sku: { type: String, trim: true, maxlength: 40 },
    compareAtPrice: { type: Number, min: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    featured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', category: 1 });
productSchema.index({ isActive: 1, category: 1, createdAt: -1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
