import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { formatCurrency, formatDate } from '../../lib/format.js';
import PageHeader from '../../components/admin/PageHeader.jsx';
import ErrorBanner from '../../components/admin/ErrorBanner.jsx';
import DataTable from '../../components/admin/DataTable.jsx';

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

/** Order ledger with search, status filtering, column sorting and inline status updates. */
export default function Orders() {
  const { orders, changeOrderStatus } = useAdmin();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (status !== 'all' && order.status !== status) return false;
      if (!term) return true;
      const haystack = `${order.customerName} ${order.customerEmail} ${order.items.map((i) => i.title).join(' ')}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [orders, query, status]);

  const columns = [
    {
      key: 'customerName',
      label: 'Customer',
      render: (o) => (
        <div>
          <p className="font-medium text-white">{o.customerName}</p>
          <p className="text-xs text-slate-500">{o.customerEmail}</p>
        </div>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      sortValue: (o) => o.items.length,
      render: (o) => (
        <p className="max-w-xs truncate text-slate-400" title={o.items.map((i) => `${i.title} × ${i.quantity}`).join(', ')}>
          {o.items.map((i) => `${i.title} × ${i.quantity}`).join(', ')}
        </p>
      ),
    },
    { key: 'totalAmount', label: 'Total', render: (o) => <span className="font-semibold text-white">{formatCurrency(o.totalAmount)}</span> },
    { key: 'createdAt', label: 'Placed', sortValue: (o) => new Date(o.createdAt), render: (o) => <span className="text-slate-400">{formatDate(o.createdAt)}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (o) => (
        <select value={o.status} onChange={(event) => changeOrderStatus(o, event.target.value)} aria-label={`Status for order by ${o.customerName}`} className="input !w-auto !py-1.5">
          {STATUSES.map((s) => (
            <option key={s} value={s} className="bg-ink-850">{s}</option>
          ))}
        </select>
      ),
    },
  ];

  const toolbar = (
    <>
      <div className="relative min-w-[14rem] flex-1">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by customer, email or product" aria-label="Search orders" className="input !pl-10" />
      </div>
      <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)} className="input !w-auto">
        <option value="all">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </>
  );

  return (
    <>
      <PageHeader title="Orders" description="Review purchases and move them through fulfilment." />
      <ErrorBanner />
      <DataTable columns={columns} rows={rows} defaultSort={{ key: 'createdAt', dir: 'desc' }} toolbar={toolbar} noun="orders" />
    </>
  );
}
