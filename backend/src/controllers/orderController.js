import Order, { ORDER_STATUSES } from '../models/Order.js';
import { createOrder } from '../services/orderService.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** POST /api/orders. Guest checkout is permitted; delegates all stock handling to the order service. */
export const placeOrder = asyncHandler(async (req, res) => {
  const order = await createOrder(req.body);
  res.status(201).json(order);
});

/** GET /api/orders (admin). Newest first. */
export const listOrders = asyncHandler(async (_req, res) => {
  res.json(await Order.find().sort({ createdAt: -1 }));
});

/** PATCH /api/orders/:id/status (admin) */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status)) throw new AppError(`Status must be one of: ${ORDER_STATUSES.join(', ')}`, 400);

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) throw new AppError('Order not found', 404);
  res.json(order);
});
