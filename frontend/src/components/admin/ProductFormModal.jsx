import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';

const EMPTY_FORM = { title: '', description: '', price: '', category: '', stockLevel: '', imageUrl: '' };

/**
 * Create/edit dialog for catalogue entries. Persistence is delegated to
 * `onSave`, which may reject; the rejection message is surfaced inline.
 * @param {{
 *   product: object|null,
 *   categories: string[],
 *   onSave: (payload: object) => Promise<void>,
 *   onClose: () => void
 * }} props
 */
export default function ProductFormModal({ product, categories, onSave, onClose }) {
  const [form, setForm] = useState(product ? { ...EMPTY_FORM, ...product } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const bind = (field) => ({
    value: form[field],
    onChange: (event) => setForm((current) => ({ ...current, [field]: event.target.value })),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave({
        title: form.title,
        description: form.description,
        category: form.category.trim() || 'General',
        imageUrl: form.imageUrl,
        price: Number(form.price),
        stockLevel: Number(form.stockLevel),
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={product ? 'Edit product' : 'Add product'}>
      <form onSubmit={handleSubmit} className="glass-strong w-full max-w-xl space-y-4 rounded-3xl p-7 shadow-glow">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{product ? 'Edit product' : 'Add product'}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="label" htmlFor="pf-title">Title</label>
          <input id="pf-title" required className="input" {...bind('title')} />
        </div>
        <div>
          <label className="label" htmlFor="pf-description">Description</label>
          <textarea id="pf-description" rows={3} className="input" {...bind('description')} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="pf-price">Price (USD)</label>
            <input id="pf-price" type="number" min="0" step="0.01" required className="input" {...bind('price')} />
          </div>
          <div>
            <label className="label" htmlFor="pf-stock">Stock level</label>
            <input id="pf-stock" type="number" min="0" step="1" required className="input" {...bind('stockLevel')} />
          </div>
          <div>
            <label className="label" htmlFor="pf-category">Category</label>
            <input id="pf-category" list="pf-categories" className="input" {...bind('category')} />
            <datalist id="pf-categories">
              {categories.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="pf-image">Image URL</label>
          <input id="pf-image" type="url" placeholder="https://" className="input" {...bind('imageUrl')} />
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Loader2 size={16} className="animate-spin" />}
            {product ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </div>
  );
}
