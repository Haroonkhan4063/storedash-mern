/**
 * @module services/orderService
 * Checkout domain logic. Isolated from the HTTP layer so it can be unit tested
 * and reused by background jobs.
 */
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { AppError } from '../utils/AppError.js';

/**
 * Collapses duplicate product ids into a single line and validates quantities.
 * @param {Array<{productId: string, quantity: number}>} items
 * @returns {Array<{productId: string, quantity: number}>}
 */
function normaliseLines(items) {
  const merged = new Map();
  for (const { productId, quantity } of items) {
    const qty = Number(quantity);
    if (!productId || !Number.isInteger(qty) || qty < 1) {
      throw new AppError('Each item requires a product and a whole-number quantity of at least 1', 400);
    }
    merged.set(String(productId), (merged.get(String(productId)) || 0) + qty);
  }
  return [...merged].map(([productId, quantity]) => ({ productId, quantity }));
}

/**
 * Creates an order and decrements inventory.
 *
 * Concurrency model: each line performs a single conditional `$inc`
 * (`stockLevel >= quantity`), which MongoDB evaluates atomically per document.
 * Overselling is therefore impossible even under parallel checkouts. Lines that
 * were already reserved are released via compensating increments if a later
 * line fails, keeping the operation all-or-nothing without requiring a replica set.
 * Unit prices are always read from the database; client-supplied prices are ignored.
 *
 * @param {object} payload
 * @param {string} payload.customerName
 * @param {string} [payload.customerEmail]
 * @param {string} [payload.shippingAddress]
 * @param {Array<{productId: string, quantity: number}>} payload.items
 * @returns {Promise<import('mongoose').HydratedDocument<any>>} The persisted order.
 * @throws {AppError} 400 for malformed input, 409 for insufficient stock or removed products.
 */
export async function createOrder({ customerName, customerEmail, shippingAddress, items }) {
  if (!customerName?.trim()) throw new AppError('Customer name is required', 400);
  if (!Array.isArray(items) || items.length === 0) throw new AppError('An order requires at least one item', 400);

  const lines = normaliseLines(items);
  const reserved = [];

  try {
    const orderItems = [];
    let total = 0;

    for (const { productId, quantity } of lines) {
      const product = await Product.findOneAndUpdate(
        { _id: productId, stockLevel: { $gte: quantity } },
        { $inc: { stockLevel: -quantity } },
        { new: true }
      );

      if (!product) {
        const current = await Product.findById(productId).select('title stockLevel');
        throw new AppError(
          current
            ? `Insufficient stock for "${current.title}" (${current.stockLevel} available)`
            : 'A product in your cart is no longer available',
          409
        );
      }

      reserved.push({ id: product._id, quantity });
      orderItems.push({ product: product._id, title: product.title, category: product.category, price: product.price, quantity });
      total += product.price * quantity;
    }

    return await Order.create({
      customerName: customerName.trim(),
      customerEmail,
      shippingAddress,
      items: orderItems,
      totalAmount: Math.round(total * 100) / 100,
    });
  } catch (error) {
    await Promise.all(reserved.map(({ id, quantity }) => Product.updateOne({ _id: id }, { $inc: { stockLevel: quantity } })));
    throw error;
  }
}
