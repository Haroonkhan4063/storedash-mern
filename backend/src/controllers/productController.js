import Product, { PRODUCT_WRITABLE_FIELDS } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pick } from '../utils/pick.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * GET /api/products
 * Public catalog listing. Optional `category` and case-insensitive `search` query parameters.
 */
export const listProducts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
  if (req.query.search) filter.title = { $regex: escapeRegex(String(req.query.search)), $options: 'i' };

  res.json(await Product.find(filter).sort({ createdAt: -1 }));
});

/** GET /api/products/:id */
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.json(product);
});

/** POST /api/products (admin) */
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(pick(req.body, PRODUCT_WRITABLE_FIELDS));
  res.status(201).json(product);
});

/** PUT /api/products/:id (admin). Accepts partial payloads, e.g. stock-only adjustments. */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, pick(req.body, PRODUCT_WRITABLE_FIELDS), {
    new: true,
    runValidators: true,
  });
  if (!product) throw new AppError('Product not found', 404);
  res.json(product);
});

/** DELETE /api/products/:id (admin) */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.json({ _id: product._id });
});
