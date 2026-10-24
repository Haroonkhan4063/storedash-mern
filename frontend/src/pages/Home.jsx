import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, PackageSearch, SlidersHorizontal, X, ArrowDownWideNarrow } from 'lucide-react';
import { useProducts } from '../hooks/useProducts.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { applyFilters, countActiveFilters, DEFAULT_FILTERS, SORT_OPTIONS } from '../lib/filters.js';
import { formatCurrency } from '../lib/format.js';
import SearchBar from '../components/shop/SearchBar.jsx';
import FilterSidebar from '../components/shop/FilterSidebar.jsx';
import ProductCard from '../components/shop/ProductCard.jsx';
import ProductVisual from '../components/shop/ProductVisual.jsx';

const PAGE_SIZE = 12;

/**
 * Storefront landing page: hero, faceted search, and a progressively revealed product grid.
 * Filtering runs client-side against the in-memory catalogue; the search term is
 * debounced so typing never blocks rendering of large result sets.
 */
export default function Home() {
  const { products, loading, error, reload } = useProducts();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchRef = useRef(null);
  const debouncedQuery = useDebounce(filters.query, 200);

  const patchFilters = (patch) => setFilters((current) => ({ ...current, ...patch }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  useEffect(() => {
    const onKey = (event) => {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (event.key === '/' && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const effective = useMemo(() => ({ ...filters, query: debouncedQuery }), [filters, debouncedQuery]);
  const results = useMemo(() => applyFilters(products, effective), [products, effective]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [effective]);

  const categories = useMemo(() => {
    const counts = products.reduce((acc, { category }) => ({ ...acc, [category]: (acc[category] || 0) + 1 }), {});
    return [{ name: 'All', count: products.length }, ...Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => ({ name, count }))];
  }, [products]);

  const priceBounds = useMemo(() => {
    const prices = products.map((product) => product.price);
    return prices.length ? { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) } : { min: 0, max: 0 };
  }, [products]);

  const showcase = useMemo(() => [...products].sort((a, b) => b.price - a.price).slice(0, 4), [products]);
  const activeCount = countActiveFilters(filters);
  const dirty = activeCount > 0 || filters.query !== '';

  return (
    <main>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-14 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.15fr_1fr]">
        <div className="animate-rise">
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Hardware that earns its place on your desk.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            {products.length || 56} hand-picked devices across electronics, audio, wearables and computing. Search the full catalogue and see live stock before you buy.
          </p>
          <div className="mt-9 max-w-xl">
            <SearchBar ref={searchRef} value={filters.query} onChange={(query) => patchFilters({ query })} />
          </div>
        </div>

        <div className="hidden grid-cols-2 gap-4 lg:grid" aria-hidden={showcase.length === 0}>
          {showcase.map((product, index) => (
            <div
              key={product._id}
              className={`glass overflow-hidden rounded-2xl ${index % 2 ? 'translate-y-6' : ''} animate-rise`}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <ProductVisual product={product} className="aspect-[5/4]" iconSize={32} />
              <div className="p-3.5">
                <p className="truncate text-sm font-semibold text-white">{product.title}</p>
                <p className="text-sm text-neon-cyan">{formatCurrency(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
          <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="lg:sticky lg:top-24">
              <FilterSidebar filters={filters} onChange={patchFilters} categories={categories} priceBounds={priceBounds} onReset={resetFilters} dirty={dirty} />
            </div>
          </aside>

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-400" aria-live="polite">
                <span className="font-semibold text-white">{results.length}</span> {results.length === 1 ? 'product' : 'products'}
                {filters.query && (
                  <>
                    {' '}for &ldquo;<span className="text-slate-200">{filters.query}</span>&rdquo;
                  </>
                )}
              </p>

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setFiltersOpen((open) => !open)} className="btn-ghost lg:hidden">
                  <SlidersHorizontal size={16} /> Filters{activeCount > 0 && ` (${activeCount})`}
                </button>
                <label className="glass relative flex items-center rounded-xl">
                  <ArrowDownWideNarrow size={16} className="pointer-events-none absolute left-3 text-slate-400" />
                  <span className="sr-only">Sort products</span>
                  <select
                    value={filters.sort}
                    onChange={(event) => patchFilters({ sort: event.target.value })}
                    className="appearance-none bg-transparent py-2.5 pl-9 pr-4 text-sm font-medium text-white focus:outline-none"
                  >
                    {SORT_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value} className="bg-ink-850">
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {dirty && (
              <div className="mb-6 flex flex-wrap gap-2">
                {filters.category !== 'All' && <ActiveChip label={filters.category} onRemove={() => patchFilters({ category: 'All' })} />}
                {filters.minPrice !== '' && <ActiveChip label={`From ${formatCurrency(Number(filters.minPrice))}`} onRemove={() => patchFilters({ minPrice: '' })} />}
                {filters.maxPrice !== '' && <ActiveChip label={`Up to ${formatCurrency(Number(filters.maxPrice))}`} onRemove={() => patchFilters({ maxPrice: '' })} />}
                {filters.inStockOnly && <ActiveChip label="In stock" onRemove={() => patchFilters({ inStockOnly: false })} />}
                <button type="button" onClick={resetFilters} className="px-2 text-sm font-medium text-slate-400 transition hover:text-white">
                  Clear all
                </button>
              </div>
            )}

            {loading && (
              <div className="grid place-items-center py-28 text-slate-400">
                <Loader2 className="animate-spin" size={26} />
              </div>
            )}

            {error && (
              <div className="glass rounded-2xl border-rose-500/30 p-6 text-center">
                <p className="font-semibold text-white">The catalogue could not be loaded</p>
                <p className="mt-1 text-sm text-slate-400">{error}</p>
                <button type="button" onClick={reload} className="btn-ghost mt-4">Try again</button>
              </div>
            )}

            {!loading && !error && results.length === 0 && (
              <div className="glass grid place-items-center rounded-2xl px-6 py-20 text-center">
                <PackageSearch size={38} className="text-slate-500" />
                <p className="mt-4 font-semibold text-white">No products match these filters</p>
                <p className="mt-1 text-sm text-slate-400">Try a broader search or remove a filter.</p>
                <button type="button" onClick={resetFilters} className="btn-primary mt-5">Reset filters</button>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.slice(0, visibleCount).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {results.length > visibleCount && (
              <div className="mt-10 text-center">
                <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="btn-ghost !px-6">
                  Show more ({results.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

/**
 * Removable pill representing a single active filter.
 * @param {{label: string, onRemove: () => void}} props
 */
function ActiveChip({ label, onRemove }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full border border-neon-violet/40 bg-neon-violet/15 px-3 py-1 text-sm font-medium text-white transition hover:bg-neon-violet/25"
      aria-label={`Remove filter ${label}`}
    >
      {label} <X size={13} />
    </button>
  );
}
