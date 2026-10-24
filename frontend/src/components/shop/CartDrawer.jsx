import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { formatCurrency } from '../../lib/format.js';
import ProductVisual from './ProductVisual.jsx';

/** Slide-over cart bound entirely to {@link useCart}; it keeps no local state. */
export default function CartDrawer() {
  const { items, subtotal, isOpen, setIsOpen, updateQuantity, removeItem } = useCart();

  return (
    <>
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      <aside
        role="dialog"
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
        className={`glass-strong fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-semibold">Your cart</h2>
          <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="grid flex-1 place-items-center px-6 text-center">
            <div>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/5 text-slate-500">
                <ShoppingBag size={28} />
              </span>
              <p className="mt-4 font-semibold text-white">Your cart is empty</p>
              <p className="mt-1 text-sm text-slate-400">Products you add will appear here.</p>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-white/10 overflow-y-auto px-5">
              {items.map((line) => (
                <li key={line._id} className="flex gap-4 py-4">
                  <ProductVisual product={line} className="h-20 w-20 shrink-0 rounded-xl" iconSize={24} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug text-white">{line.title}</p>
                      <button type="button" onClick={() => removeItem(line._id)} className="text-slate-500 transition hover:text-rose-400" aria-label={`Remove ${line.title}`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-400">{formatCurrency(line.price)}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/5">
                        <button type="button" onClick={() => updateQuantity(line._id, line.quantity - 1)} className="p-1.5 text-slate-300 hover:text-white" aria-label="Decrease quantity">
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-white">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(line._id, line.quantity + 1)}
                          disabled={line.quantity >= line.stockLevel}
                          className="p-1.5 text-slate-300 hover:text-white disabled:text-slate-600"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-white">{formatCurrency(line.price * line.quantity)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-display text-xl font-bold text-white">{formatCurrency(subtotal)}</span>
              </div>
              <Link to="/checkout" onClick={() => setIsOpen(false)} className="btn-primary w-full !py-3">
                Proceed to checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
