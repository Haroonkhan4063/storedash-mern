/**
 * @module services/analyticsService
 * Read-only aggregation pipelines powering the administrator dashboard.
 * Cancelled orders are excluded from every revenue-bearing metric.
 */
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

const DAY_MS = 86_400_000;
const LOW_STOCK_THRESHOLD = 5;
const ALLOWED_RANGES = [7, 30, 90];

const startOfUtcDay = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
const toDayKey = (date) => date.toISOString().slice(0, 10);
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Percentage change between two periods.
 * @returns {number|null} `null` when the previous value is zero and a ratio is undefined.
 */
const percentChange = (current, previous) => (previous === 0 ? null : round2(((current - previous) / previous) * 100));

/**
 * Normalises a client-supplied range to one of the supported window sizes.
 * @param {unknown} value
 * @returns {number}
 */
export const resolveRange = (value) => {
  const days = Number(value);
  return ALLOWED_RANGES.includes(days) ? days : 30;
};

/**
 * Revenue and order totals for a half-open time window.
 * @param {Date} from Inclusive lower bound.
 * @param {Date} to Exclusive upper bound.
 * @returns {Promise<{revenue: number, orders: number}>}
 */
async function periodTotals(from, to) {
  const [row] = await Order.aggregate([
    { $match: { createdAt: { $gte: from, $lt: to }, status: { $ne: 'cancelled' } } },
    { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
  ]);
  return { revenue: row?.revenue ?? 0, orders: row?.orders ?? 0 };
}

/**
 * Builds the complete dashboard payload for the trailing `days` window.
 * @param {number} days One of 7, 30 or 90.
 * @returns {Promise<object>} KPI deltas, time series, breakdowns, inventory health and recent orders.
 */
export async function getDashboardAnalytics(days) {
  const today = startOfUtcDay(new Date());
  const to = new Date(today.getTime() + DAY_MS);
  const from = new Date(to.getTime() - days * DAY_MS);
  const previousFrom = new Date(from.getTime() - days * DAY_MS);
  const activeInRange = { createdAt: { $gte: from, $lt: to }, status: { $ne: 'cancelled' } };

  const [current, previous, daily, byCategory, topProducts, statuses, recentOrders, inventory, customerTotal, newCustomers] = await Promise.all([
    periodTotals(from, to),
    periodTotals(previousFrom, from),
    Order.aggregate([
      { $match: activeInRange },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: activeInRange },
      { $unwind: '$items' },
      { $group: { _id: '$items.category', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, units: { $sum: '$items.quantity' } } },
      { $sort: { revenue: -1 } },
    ]),
    Order.aggregate([
      { $match: activeInRange },
      { $unwind: '$items' },
      { $group: { _id: '$items.title', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, units: { $sum: '$items.quantity' } } },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]),
    Order.aggregate([{ $match: { createdAt: { $gte: from, $lt: to } } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.find().sort({ createdAt: -1 }).limit(6),
    Product.aggregate([
      {
        $group: {
          _id: null,
          products: { $sum: 1 },
          inventoryValue: { $sum: { $multiply: ['$price', '$stockLevel'] } },
          lowStock: { $sum: { $cond: [{ $and: [{ $gt: ['$stockLevel', 0] }, { $lte: ['$stockLevel', LOW_STOCK_THRESHOLD] }] }, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $eq: ['$stockLevel', 0] }, 1, 0] } },
        },
      },
    ]),
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: from, $lt: to } }),
  ]);

  const dailyByKey = new Map(daily.map((row) => [row._id, row]));
  const salesTrend = Array.from({ length: days }, (_, index) => {
    const key = toDayKey(new Date(from.getTime() + index * DAY_MS));
    const row = dailyByKey.get(key);
    return { date: key, revenue: round2(row?.revenue ?? 0), orders: row?.orders ?? 0 };
  });

  const aovCurrent = current.orders ? current.revenue / current.orders : 0;
  const aovPrevious = previous.orders ? previous.revenue / previous.orders : 0;
  const stock = inventory[0] ?? { products: 0, inventoryValue: 0, lowStock: 0, outOfStock: 0 };

  return {
    range: { days, from, to },
    kpis: {
      revenue: { value: round2(current.revenue), change: percentChange(current.revenue, previous.revenue) },
      orders: { value: current.orders, change: percentChange(current.orders, previous.orders) },
      averageOrderValue: { value: round2(aovCurrent), change: percentChange(aovCurrent, aovPrevious) },
      customers: { value: customerTotal, added: newCustomers },
    },
    inventory: { products: stock.products, inventoryValue: round2(stock.inventoryValue), lowStock: stock.lowStock, outOfStock: stock.outOfStock },
    salesTrend,
    revenueByCategory: byCategory.map(({ _id, revenue, units }) => ({ category: _id || 'Uncategorised', revenue: round2(revenue), units })),
    topProducts: topProducts.map(({ _id, revenue, units }) => ({ title: _id, revenue: round2(revenue), units })),
    statusBreakdown: statuses.map(({ _id, count }) => ({ status: _id, count })),
    recentOrders,
  };
}

/**
 * Customer directory enriched with lifetime order counts and spend.
 * @returns {Promise<Array<object>>}
 */
export async function getCustomerSummaries() {
  const [customers, spend] = await Promise.all([
    User.find({ role: 'customer' }).sort({ createdAt: -1 }),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, customerEmail: { $ne: '' } } },
      { $group: { _id: '$customerEmail', orders: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' }, lastOrderAt: { $max: '$createdAt' } } },
    ]),
  ]);
  const spendByEmail = new Map(spend.map((row) => [row._id, row]));

  return customers.map(({ _id, name, email, createdAt }) => {
    const stats = spendByEmail.get(email);
    return {
      _id,
      name,
      email,
      createdAt,
      orders: stats?.orders ?? 0,
      totalSpent: round2(stats?.totalSpent ?? 0),
      lastOrderAt: stats?.lastOrderAt ?? null,
    };
  });
}
