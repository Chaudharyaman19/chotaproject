export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  isActive?: boolean;
  brand?: string;
  sku?: string;
  compareAtPrice?: number | null;
  rating?: number;
  featured?: boolean;
  tags?: string[];
  images?: string[];
  createdAt?: string;
}
export interface User { id: string; name: string; email: string; role: 'CUSTOMER' | 'ADMIN'; }
export interface CartItem { product: Product; quantity: number; }
export interface OrderItem { product: string; name: string; price: number; quantity: number; }
export interface Order {
  _id: string; orderNumber: string; items: OrderItem[];
  customerName: string; phone: string; shippingAddress: string;
  subtotal: number; shippingFee?: number; total: number; paymentMethod: 'COD';
  paymentStatus: string; status: string; createdAt: string;
  user?: { _id?: string; name?: string; email?: string } | string;
}
export interface Customer {
  _id: string; name: string; email: string; role: 'CUSTOMER' | 'ADMIN';
  createdAt: string; orders: number; spent: number; lastOrderAt: string | null;
}
export interface InboxMessage {
  _id: string; kind: 'CONTACT' | 'NEWSLETTER'; name?: string; email: string;
  subject?: string; message?: string; handled: boolean; createdAt: string;
}
