export interface Product {
  _id: string; name: string; description: string; price: number;
  image: string; category: string; stock: number; isActive?: boolean;
}
export interface User { id: string; name: string; email: string; role: 'CUSTOMER' | 'ADMIN'; }
export interface CartItem { product: Product; quantity: number; }
export interface OrderItem { product: string; name: string; price: number; quantity: number; }
export interface Order {
  _id: string; orderNumber: string; items: OrderItem[];
  customerName: string; phone: string; shippingAddress: string;
  subtotal: number; total: number; paymentMethod: 'COD';
  paymentStatus: string; status: string; createdAt: string;
}
