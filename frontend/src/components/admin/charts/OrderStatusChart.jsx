import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { STATUS_COLORS } from './palette.js';
import ChartCard from './ChartCard.jsx';
import ChartTooltip from './ChartTooltip.jsx';

const STATUS_ORDER = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

/**
 * Donut breakdown of orders by fulfilment status.
 * @param {{data: Array<{status: string, count: number}>}} props
 */
export default function OrderStatusChart({ data }) {
  const rows = STATUS_ORDER.map((status) => ({ status, count: data.find((d) => d.status === status)?.count ?? 0 })).filter((row) => row.count > 0);
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <ChartCard title="Order status" subtitle="Fulfilment pipeline in this period">
      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows} dataKey="count" nameKey="status" innerRadius={62} outerRadius={88} paddingAngle={3} stroke="none">
              {rows.map((row) => (
                <Cell key={row.status} fill={STATUS_COLORS[row.status]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-2xl font-bold text-white">{total}</p>
            <p className="text-xs text-slate-400">orders</p>
          </div>
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {rows.map((row) => (
          <li key={row.status} className="flex items-center gap-2 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[row.status] }} />
            <span className="capitalize">{row.status}</span>
            <span className="ml-auto font-semibold text-white">{row.count}</span>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}
