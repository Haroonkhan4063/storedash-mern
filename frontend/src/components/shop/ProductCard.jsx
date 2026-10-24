import { Plus, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { formatCurrency } from '../../lib/format.js';
import { LOW_STOCK_THRESHOLD } from '../../lib/categories.js';
import ProductVisual from './ProductVisual.jsx';

/**
 * Storefront product tile. Purchase affordances reflect live inventory and the
 * quantity already reserved in the cart.
 * @param {{product: {_id: string, title: string, description: string, price: number, category: string, stockLevel: number, imageUrl?: string}}} props
 */
export default function ProductCard({ product }) {
  const { addToCart, items } = useCart();
  const inCart = items.find((line) => line._id === product._id)?.quantity ?? 0;
  const soldOut = product.stockLevel === 0;
  const maxed = !soldOut && inCart >= product.stockLevel;

  return (
    <article className="group glass flex flex-col overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:border-neon-violet/40 hover:shadow-glow">
      <div className="relative">
        <ProductVisual product={product} className="aspect-[4/3]" />
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-ink-950/70 px-2.5 py-1 text-xs font-medium text-slate-200 backdrop-blur-md">
          {product.category}
        </span>
        {soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-ink-950/70 backdrop-blur-[2px]">
            <span className="rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold text-white">Sold out</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold leading-snug">{product.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-400">{product.description}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="font-display text-xl font-bold text-white">{formatCurrency(product.price)}</p>
            {!soldOut && product.stockLevel <= LOW_STOCK_THRESHOLD && (
              <p className="mt-0.5 text-xs font-medium text-amber-400">Only {product.stockLevel} left</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => addToCart(product)}
            disabled={soldOut || maxed}
            className="btn-primary !px-3.5"
            aria-label={`Add ${product.title} to cart`}
          >
            {maxed ? <Check size={16} /> : <Plus size={16} />}
            {maxed ? 'In cart' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  );
}
