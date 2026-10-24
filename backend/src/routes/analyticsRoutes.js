import { Router } from 'express';
import { dashboardAnalytics, customerDirectory } from '../controllers/analyticsController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

router.use(protect, restrictTo('admin'));
router.get('/', dashboardAnalytics);
router.get('/customers', customerDirectory);

export default router;
