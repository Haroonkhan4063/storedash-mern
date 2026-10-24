import { LOW_STOCK_THRESHOLD } from '../../lib/categories.js';

/**
 * Inventory health indicator derived from the stock level.
 * @param {{level: number}} props
 */
export default function StockBadge({ level }) {
  if (level === 0) return <span className="rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-300 ring-1 ring-rose-500/30">Out of stock</span>;
  if (level <= LOW_STOCK_THRESHOLD) return <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300 ring-1 ring-amber-500/30">Low stock</span>;
  return <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">In stock</span>;
}
