import { Router } from 'express';
import { adminListProducts, createProduct, deleteProduct, getProduct, listProducts, updateProduct } from '../controllers/productController';
import { adminOnly, auth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const r = Router();
r.get('/', asyncHandler(listProducts));
r.get('/admin/all', auth(), adminOnly, asyncHandler(adminListProducts));
r.get('/:id', asyncHandler(getProduct));
r.post('/', auth(), adminOnly, asyncHandler(createProduct));
r.put('/:id', auth(), adminOnly, asyncHandler(updateProduct));
r.delete('/:id', auth(), adminOnly, asyncHandler(deleteProduct));
export default r;
