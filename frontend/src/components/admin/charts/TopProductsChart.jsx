import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCompactCurrency, formatCurrency } from '../../../lib/format.js';
import { AXIS_PROPS, GRID_STROKE } from './palette.js';
import ChartCard from './ChartCard.jsx';
import ChartTooltip from './ChartTooltip.jsx';

/**
 * Horizontal bar chart of the best-selling products by revenue.
 * @param {{data: Array<{title: string, revenue: number, units: number}>}} props
 */
export default function TopProductsChart({ data }) {
  return (
    <ChartCard title="Top products" subtitle="Best sellers by revenue">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
            <XAxis type="number" tickFormatter={formatCompactCurrency} {...AXIS_PROPS} />
            <YAxis type="category" dataKey="title" width={132} tickFormatter={(v) => (v.length > 18 ? `${v.slice(0, 17)}…` : v)} {...AXIS_PROPS} />
            <Tooltip content={<ChartTooltip formatValue={formatCurrency} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="revenue" name="Revenue" fill="#22d3ee" radius={[0, 8, 8, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
