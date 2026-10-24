import { useMemo, useState } from 'react';
import { PlusCircle, Search, Pencil, Trash2, Minus, Plus } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { applyFilters, DEFAULT_FILTERS } from '../../lib/filters.js';
import { formatCurrency } from '../../lib/format.js';
import { LOW_STOCK_THRESHOLD } from '../../lib/categories.js';
import PageHeader from '../../components/admin/PageHeader.jsx';
import ErrorBanner from '../../components/admin/ErrorBanner.jsx';
import DataTable from '../../components/admin/DataTable.jsx';
import StockBadge from '../../components/admin/StockBadge.jsx';
import ProductFormModal from '../../components/admin/ProductFormModal.jsx';
import ProductVisual from '../../components/shop/ProductVisual.jsx';

/**
 * Inventory management: filterable, sortable product table with inline stock
 * adjustment and create / edit / delete flows.
 */
export default function Products() {
  const { products, saveProduct, deleteProduct, adjustStock } = useAdmin();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('all');
  const [modal, setModal] = useState({ open: false, product: null });

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))].sort(), [products]);
  const maxStock = useMemo(() => Math.max(1, ...products.map((p) => p.stockLevel)), [products]);

  const rows = useMemo(() => {
    const matched = applyFilters(products, { ...DEFAULT_FILTERS, query, category });
    if (status === 'low') return matched.filter((p) => p.stockLevel > 0 && p.stockLevel <= LOW_STOCK_THRESHOLD);
    if (status === 'out') return matched.filter((p) => p.stockLevel === 0);
    if (status === 'healthy') return matched.filter((p) => p.stockLevel > LOW_STOCK_THRESHOLD);
    return matched;
  }, [products, query, category, status]);

  const confirmDelete = (product) => {
    if (window.confirm(`Delete "${product.title}"? This action cannot be undone.`)) deleteProduct(product);
  };

  const columns = [
    {
      key: 'title',
      label: 'Product',
      render: (p) => (
        <div className="flex items-center gap-3">
          <ProductVisual product={p} className="h-11 w-11 shrink-0 rounded-lg" iconSize={18} />
          <span className="max-w-[16rem] truncate font-medium text-white">{p.title}</span>
        </div>
      ),
    },
    { key: 'category', label: 'Category', render: (p) => <span className="text-slate-400">{p.category}</span> },
    { key: 'price', label: 'Price', render: (p) => <span className="font-medium text-white">{formatCurrency(p.price)}</span> },
    {
      key: 'stockLevel',
      label: 'Stock',
      render: (p) => (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => adjustStock(p, -1)} disabled={p.stockLevel === 0} className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:bg-white/10 disabled:opacity-30" aria-label={`Decrease stock of ${p.title}`}>
            <Minus size={13} />
          </button>
          <div className="w-20">
            <p className="font-semibold text-white">{p.stockLevel}</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${p.stockLevel === 0 ? 'bg-rose-400' : p.stockLevel <= LOW_STOCK_THRESHOLD ? 'bg-amber-400' : 'bg-gradient-to-r from-neon-violet to-neon-cyan'}`}
                style={{ width: `${(p.stockLevel / maxStock) * 100}%` }}
              />
            </div>
          </div>
          <button type="button" onClick={() => adjustStock(p, 1)} className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:bg-white/10" aria-label={`Increase stock of ${p.title}`}>
            <Plus size={13} />
          </button>
        </div>
      ),
    },
    { key: 'status', label: 'Status', sortValue: (p) => p.stockLevel, render: (p) => <StockBadge level={p.stockLevel} /> },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <button type="button" onClick={() => setModal({ open: true, product: p })} className="rounded-lg p-2 text-slate-400 transition hover:bg-neon-violet/15 hover:text-white" aria-label={`Edit ${p.title}`}>
            <Pencil size={16} />
          </button>
          <button type="button" onClick={() => confirmDelete(p)} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-300" aria-label={`Delete ${p.title}`}>
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const toolbar = (
    <>
      <div className="relative min-w-[14rem] flex-1">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search inventory" aria-label="Search inventory" className="input !pl-10" />
      </div>
      <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)} className="input !w-auto">
        <option value="All">All categories</option>
        {categories.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
      <select aria-label="Filter by stock status" value={status} onChange={(event) => setStatus(event.target.value)} className="input !w-auto">
        <option value="all">Any stock level</option>
        <option value="healthy">Healthy</option>
        <option value="low">Low stock</option>
        <option value="out">Out of stock</option>
      </select>
    </>
  );

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Manage the catalogue and monitor stock levels."
        actions={
          <button type="button" onClick={() => setModal({ open: true, product: null })} className="btn-primary">
            <PlusCircle size={17} /> Add product
          </button>
        }
      />
      <ErrorBanner />
      <DataTable columns={columns} rows={rows} defaultSort={{ key: 'title', dir: 'asc' }} toolbar={toolbar} noun="products" />

      {modal.open && (
        <ProductFormModal
          product={modal.product}
          categories={categories}
          onSave={async (payload) => {
            await saveProduct(modal.product?._id, payload);
            setModal({ open: false, product: null });
          }}
          onClose={() => setModal({ open: false, product: null })}
        />
      )}
    </>
  );
}
