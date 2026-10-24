import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { formatCurrency, formatDate } from '../../lib/format.js';
import PageHeader from '../../components/admin/PageHeader.jsx';
import ErrorBanner from '../../components/admin/ErrorBanner.jsx';
import DataTable from '../../components/admin/DataTable.jsx';

/** Customer directory showing lifetime orders and spend, sortable by any metric. */
export default function Customers() {
  const { customers } = useAdmin();
  const [query, setQuery] = useState('');
  const [segment, setSegment] = useState('all');

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return customers.filter((customer) => {
      if (segment === 'active' && customer.orders === 0) return false;
      if (segment === 'inactive' && customer.orders > 0) return false;
      return !term || `${customer.name} ${customer.email}`.toLowerCase().includes(term);
    });
  }, [customers, query, segment]);

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-neon-violet/40 to-neon-cyan/30 text-sm font-bold text-white">{c.name.charAt(0)}</span>
          <div>
            <p className="font-medium text-white">{c.name}</p>
            <p className="text-xs text-slate-500">{c.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'orders', label: 'Orders', render: (c) => <span className="font-medium text-white">{c.orders}</span> },
    { key: 'totalSpent', label: 'Lifetime spend', render: (c) => <span className="font-semibold text-white">{formatCurrency(c.totalSpent)}</span> },
    { key: 'lastOrderAt', label: 'Last order', sortValue: (c) => (c.lastOrderAt ? new Date(c.lastOrderAt) : new Date(0)), render: (c) => <span className="text-slate-400">{c.lastOrderAt ? formatDate(c.lastOrderAt) : 'No orders yet'}</span> },
    { key: 'createdAt', label: 'Joined', sortValue: (c) => new Date(c.createdAt), render: (c) => <span className="text-slate-400">{formatDate(c.createdAt)}</span> },
  ];

  const toolbar = (
    <>
      <div className="relative min-w-[14rem] flex-1">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customers" aria-label="Search customers" className="input !pl-10" />
      </div>
      <select aria-label="Filter by activity" value={segment} onChange={(event) => setSegment(event.target.value)} className="input !w-auto">
        <option value="all">All customers</option>
        <option value="active">With orders</option>
        <option value="inactive">No orders yet</option>
      </select>
    </>
  );

  return (
    <>
      <PageHeader title="Customers" description="Understand who is buying and how much they are worth." />
      <ErrorBanner />
      <DataTable columns={columns} rows={rows} defaultSort={{ key: 'totalSpent', dir: 'desc' }} toolbar={toolbar} noun="customers" />
    </>
  );
}
