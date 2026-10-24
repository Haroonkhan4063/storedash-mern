import { Router } from 'express';
import { placeOrder, listOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

router.post('/', placeOrder);
router.get('/', protect, restrictTo('admin'), listOrders);
router.patch('/:id/status', protect, restrictTo('admin'), updateOrderStatus);

export default router;
