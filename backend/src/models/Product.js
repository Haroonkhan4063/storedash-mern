import mongoose from 'mongoose';

/**
 * Catalog item. `stockLevel` is the single source of truth for inventory and is
 * only ever decremented through the atomic path in the order service.
 */
const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 140 },
    description: { type: String, default: '', trim: true, maxlength: 1200 },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    category: { type: String, default: 'General', trim: true, index: true },
    stockLevel: {
      type: Number,
      required: [true, 'Stock level is required'],
      min: [0, 'Stock level cannot be negative'],
      default: 0,
      validate: { validator: Number.isInteger, message: 'Stock level must be a whole number' },
    },
    imageUrl: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text' });

export const PRODUCT_WRITABLE_FIELDS = ['title', 'description', 'price', 'category', 'stockLevel', 'imageUrl'];

export default mongoose.model('Product', productSchema);
