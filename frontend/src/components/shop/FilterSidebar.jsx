import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { getCategoryIcon } from '../../lib/categories.js';
import { DEFAULT_FILTERS } from '../../lib/filters.js';

/**
 * Faceted filter panel: category (with live counts), price range, and availability.
 * @param {{
 *   filters: typeof DEFAULT_FILTERS,
 *   onChange: (patch: Partial<typeof DEFAULT_FILTERS>) => void,
 *   categories: Array<{name: string, count: number}>,
 *   priceBounds: {min: number, max: number},
 *   onReset: () => void,
 *   dirty: boolean
 * }} props
 */
export default function FilterSidebar({ filters, onChange, categories, priceBounds, onReset, dirty }) {
  return (
    <div className="glass space-y-7 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <SlidersHorizontal size={17} className="text-neon-cyan" /> Filters
        </h2>
        {dirty && (
          <button type="button" onClick={onReset} className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-white">
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-white">Category</legend>
        <ul className="space-y-1">
          {categories.map(({ name, count }) => {
            const Icon = name === 'All' ? SlidersHorizontal : getCategoryIcon(name);
            const active = filters.category === name;
            return (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => onChange({ category: name })}
                  aria-pressed={active}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                    active ? 'bg-gradient-to-r from-neon-violet/25 to-neon-cyan/10 text-white ring-1 ring-neon-violet/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} /> {name === 'All' ? 'All products' : name}
                  </span>
                  <span className={`text-xs ${active ? 'text-slate-200' : 'text-slate-500'}`}>{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-white">Price range</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['minPrice', 'Min', priceBounds.min],
            ['maxPrice', 'Max', priceBounds.max],
          ].map(([field, label, placeholder]) => (
            <label key={field} className="block">
              <span className="sr-only">{label} price</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">$</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={filters[field]}
                  onChange={(event) => onChange({ [field]: event.target.value })}
                  placeholder={String(placeholder)}
                  className="input !pl-7"
                />
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">In stock only</span>
        <span className="relative inline-flex">
          <input type="checkbox" checked={filters.inStockOnly} onChange={(event) => onChange({ inStockOnly: event.target.checked })} className="peer sr-only" />
          <span className="h-6 w-11 rounded-full bg-ink-600 transition peer-checked:bg-neon-violet peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-neon-cyan" />
          <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
        </span>
      </label>
    </div>
  );
}
