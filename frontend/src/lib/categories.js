/**
 * @module lib/categories
 * Visual metadata for product categories, shared by the storefront and dashboard.
 */
import { Cpu, Headphones, Watch, Laptop, Briefcase, Zap, Package } from 'lucide-react';

const CATEGORY_ICONS = {
  'Premium Electronics': Cpu,
  Audio: Headphones,
  Wearables: Watch,
  Computing: Laptop,
  Accessories: Briefcase,
  'Tech Gear': Zap,
};

/**
 * @param {string} category
 * @returns {import('react').ComponentType<{size?: number, className?: string}>}
 */
export const getCategoryIcon = (category) => CATEGORY_ICONS[category] || Package;

export const LOW_STOCK_THRESHOLD = 5;

/**
 * Derives a stable hue from a string so generated artwork is deterministic per product.
 * @param {string} seed
 * @returns {number} Hue in degrees.
 */
export const hueFromString = (seed = '') => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  return hash;
};
