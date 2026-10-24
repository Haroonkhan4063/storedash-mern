/**
 * @module lib/filters
 * Pure catalogue filtering and sorting. Kept free of React so the logic can be
 * unit tested and reused by both the storefront and the admin dashboard.
 */

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'stock-desc', label: 'Most in stock' },
];

export const DEFAULT_FILTERS = Object.freeze({
  query: '',
  category: 'All',
  minPrice: '',
  maxPrice: '',
  inStockOnly: false,
  sort: 'featured',
});

const COMPARATORS = {
  featured: () => 0,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'name-asc': (a, b) => a.title.localeCompare(b.title),
  'stock-desc': (a, b) => b.stockLevel - a.stockLevel,
};

/**
 * Applies every active filter and the selected sort to a product list.
 * Search matches against title, category and description, token by token, so
 * "oled monitor" finds products containing both words in any order.
 * @param {Array<object>} products
 * @param {typeof DEFAULT_FILTERS} filters
 * @returns {Array<object>}
 */
export function applyFilters(products, filters) {
  const tokens = filters.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const min = filters.minPrice === '' ? -Infinity : Number(filters.minPrice);
  const max = filters.maxPrice === '' ? Infinity : Number(filters.maxPrice);

  return products
    .filter((product) => {
      if (filters.category !== 'All' && product.category !== filters.category) return false;
      if (filters.inStockOnly && product.stockLevel === 0) return false;
      if (product.price < min || product.price > max) return false;
      if (tokens.length === 0) return true;
      const haystack = `${product.title} ${product.category} ${product.description}`.toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    })
    .sort(COMPARATORS[filters.sort] || COMPARATORS.featured);
}

/**
 * @param {typeof DEFAULT_FILTERS} filters
 * @returns {number} Count of non-default filters (search text excluded).
 */
export const countActiveFilters = (filters) =>
  [filters.category !== 'All', filters.minPrice !== '', filters.maxPrice !== '', filters.inStockOnly].filter(Boolean).length;
