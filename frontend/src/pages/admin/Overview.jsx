import { Link } from 'react-router-dom';
import { DollarSign, ShoppingCart, Receipt, Users, AlertTriangle, Loader2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { formatCurrency, formatDate } from '../../lib/format.js';
import PageHeader from '../../components/admin/PageHeader.jsx';
import ErrorBanner from '../../components/admin/ErrorBanner.jsx';
import StatCard from '../../components/admin/StatCard.jsx';
import SalesTrendChart from '../../components/admin/charts/SalesTrendChart.jsx';
import OrderStatusChart from '../../components/admin/charts/OrderStatusChart.jsx';
import CategoryRevenueChart from '../../components/admin/charts/CategoryRevenueChart.jsx';
import TopProductsChart from '../../components/admin/charts/TopProductsChart.jsx';
import { STATUS_COLORS } from '../../components/admin/charts/palette.js';

const RANGES = [7, 30, 90];

/**
 * Analytics landing view: KPI cards with period-over-period deltas, interactive
 * charts, a recent-orders feed, and restocking alerts. All figures originate
 * from the `/api/analytics` aggregation endpoint.
 */
export default function Overview() {
  const { analytics, days, setDays, products } = useAdmin();

  const rangeSwitch = (
    <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1" role="group" aria-label="Reporting period">
      {RANGES.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => setDays(range)}
          aria-pressed={days === range}
          className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${days === range ? 'bg-gradient-to-r from-neon-violet to-indigo-500 text-white shadow-glow' : 'text-slate-400 hover:text-white'}`}
        >
          {range}D
        </button>
      ))}
    </div>
  );

  const alerts = products
    .filter((product) => product.stockLevel <= 5)
    .sort((a, b) => a.stockLevel - b.stockLevel)
    .slice(0, 6);

  return (
    <>
      <PageHeader title="Overview" description="Sales, customers and inventory health at a glance." actions={rangeSwitch} />
      <ErrorBanner />

      {!analytics ? (
        <div className="grid min-h-[40vh] place-items-center text-slate-400">
          <Loader2 className="animate-spin" size={26} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={DollarSign} label="Revenue" value={formatCurrency(analytics.kpis.revenue.value)} change={analytics.kpis.revenue.change} hint={`vs previous ${days} days`} accent="bg-neon-violet/15 text-neon-violet" />
            <StatCard icon={ShoppingCart} label="Orders" value={analytics.kpis.orders.value} change={analytics.kpis.orders.change} hint={`vs previous ${days} days`} accent="bg-neon-cyan/15 text-neon-cyan" />
            <StatCard icon={Receipt} label="Average order value" value={formatCurrency(analytics.kpis.averageOrderValue.value)} change={analytics.kpis.averageOrderValue.change} hint={`vs previous ${days} days`} accent="bg-neon-mint/15 text-neon-mint" />
            <StatCard icon={Users} label="Customers" value={analytics.kpis.customers.value} hint={`${analytics.kpis.customers.added} joined in this period`} accent="bg-amber-500/15 text-amber-300" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <SalesTrendChart data={analytics.salesTrend} />
            <OrderStatusChart data={analytics.statusBreakdown} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryRevenueChart data={analytics.revenueByCategory} />
            <TopProductsChart data={analytics.topProducts} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="glass rounded-2xl p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold">Recent orders</h2>
                <Link to="/admin/orders" className="text-sm font-medium text-neon-cyan transition hover:text-white">View all</Link>
              </div>
              <ul className="divide-y divide-white/10">
                {analytics.recentOrders.map((order) => (
                  <li key={order._id} className="flex items-center gap-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white">{order.customerName}</p>
                      <p className="text-xs text-slate-500">{formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
                    </div>
                    <span className="rounded-full px-2.5 py-1 text-xs font-semibold capitalize" style={{ background: `${STATUS_COLORS[order.status]}26`, color: STATUS_COLORS[order.status] }}>
                      {order.status}
                    </span>
                    <p className="w-24 text-right font-semibold text-white">{formatCurrency(order.totalAmount)}</p>
                  </li>
                ))}
                {analytics.recentOrders.length === 0 && <li className="py-10 text-center text-slate-500">No orders yet.</li>}
              </ul>
            </section>

            <section className="glass rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold"><AlertTriangle size={16} className="text-amber-300" /> Restock alerts</h2>
                <Link to="/admin/products" className="text-sm font-medium text-neon-cyan transition hover:text-white">Manage</Link>
              </div>
              <ul className="space-y-3">
                {alerts.map((product) => (
                  <li key={product._id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-slate-300">{product.title}</span>
                    <span className={`shrink-0 font-semibold ${product.stockLevel === 0 ? 'text-rose-300' : 'text-amber-300'}`}>{product.stockLevel === 0 ? 'Out' : `${product.stockLevel} left`}</span>
                  </li>
                ))}
                {alerts.length === 0 && <li className="py-6 text-center text-sm text-slate-500">All products are healthy.</li>}
              </ul>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
