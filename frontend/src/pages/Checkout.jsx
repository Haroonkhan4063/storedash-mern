import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { formatCurrency } from '../lib/format.js';
import ProductVisual from '../components/shop/ProductVisual.jsx';

/**
 * Checkout flow. Only product identifiers and quantities are transmitted; the
 * API resolves prices and reserves stock, so the displayed total is advisory
 * until the order is confirmed. Card fields are collected for UX parity and are
 * never sent to the server (payments are simulated).
 */
export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    shippingAddress: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const bind = (field) => ({
    value: form[field],
    onChange: (event) => setForm((current) => ({ ...current, [field]: event.target.value })),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const placed = await api.createOrder({
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        shippingAddress: form.shippingAddress,
        items: items.map((line) => ({ productId: line._id, quantity: line.quantity })),
      });
      clearCart();
      setOrder(placed);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return (
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-neon-mint/10 text-neon-mint ring-1 ring-neon-mint/30">
          <CheckCircle2 size={40} />
        </span>
        <h1 className="mt-6 text-3xl font-bold">Order confirmed</h1>
        <p className="mt-3 text-slate-400">
          Thank you, {order.customerName}. Your payment of <span className="font-semibold text-white">{formatCurrency(order.totalAmount)}</span> was received.
        </p>
        <p className="mt-2 text-xs text-slate-500">Reference {order._id}</p>
        <Link to="/" className="btn-primary mt-9">Continue shopping</Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-lg px-4 py-28 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-slate-400">Add a few products before checking out.</p>
        <Link to="/" className="btn-primary mt-8">Browse products</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_24rem]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h1 className="text-3xl font-bold">Checkout</h1>

        <fieldset className="glass space-y-4 rounded-2xl p-6">
          <legend className="px-1 font-display text-sm font-semibold text-white">Contact and delivery</legend>
          <div>
            <label className="label" htmlFor="customerName">Full name</label>
            <input id="customerName" required autoComplete="name" className="input" {...bind('customerName')} />
          </div>
          <div>
            <label className="label" htmlFor="customerEmail">Email address</label>
            <input id="customerEmail" type="email" required autoComplete="email" className="input" {...bind('customerEmail')} />
          </div>
          <div>
            <label className="label" htmlFor="shippingAddress">Shipping address</label>
            <textarea id="shippingAddress" required rows={3} autoComplete="street-address" className="input" {...bind('shippingAddress')} />
          </div>
        </fieldset>

        <fieldset className="glass space-y-4 rounded-2xl p-6">
          <legend className="flex items-center gap-2 px-1 font-display text-sm font-semibold text-white">
            <CreditCard size={16} className="text-neon-cyan" /> Payment
          </legend>
          <div>
            <label className="label" htmlFor="cardNumber">Card number</label>
            <input id="cardNumber" required inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" className="input" {...bind('cardNumber')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="expiry">Expiry</label>
              <input id="expiry" required autoComplete="cc-exp" placeholder="MM / YY" className="input" {...bind('expiry')} />
            </div>
            <div>
              <label className="label" htmlFor="cvc">CVC</label>
              <input id="cvc" required inputMode="numeric" autoComplete="cc-csc" placeholder="123" className="input" {...bind('cvc')} />
            </div>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <Lock size={12} /> Payments are simulated in this environment. Card details never leave your browser.
          </p>
        </fieldset>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full !py-3.5 text-base">
          {submitting ? <><Loader2 size={18} className="animate-spin" /> Processing</> : `Pay ${formatCurrency(subtotal)}`}
        </button>
      </form>

      <aside className="glass-strong h-fit rounded-2xl p-6 lg:sticky lg:top-24">
        <h2 className="mb-4 text-lg font-semibold">Order summary</h2>
        <ul className="divide-y divide-white/10">
          {items.map((line) => (
            <li key={line._id} className="flex items-center gap-3 py-3">
              <ProductVisual product={line} className="h-14 w-14 shrink-0 rounded-lg" iconSize={18} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{line.title}</p>
                <p className="text-xs text-slate-500">Qty {line.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-white">{formatCurrency(line.price * line.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-slate-400">Total</span>
          <span className="font-display text-2xl font-bold text-white">{formatCurrency(subtotal)}</span>
        </div>
      </aside>
    </main>
  );
}
