import { Router } from 'express';
import { adminListProducts, createProduct, deleteProduct, getProduct, listProducts, updateProduct } from '../controllers/productController';
import { adminOnly, auth } from '../middleware/auth';

const r = Router();
r.get('/', listProducts);
r.get('/admin/all', auth(), adminOnly, adminListProducts);
r.get('/:id', getProduct);
r.post('/', auth(), adminOnly, createProduct);
r.put('/:id', auth(), adminOnly, updateProduct);
r.delete('/:id', auth(), adminOnly, deleteProduct);
export default r;
