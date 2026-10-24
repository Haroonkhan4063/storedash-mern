import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { formatCompactCurrency, formatCurrency } from '../../../lib/format.js';
import { AXIS_PROPS, CHART_COLORS, GRID_STROKE } from './palette.js';
import ChartCard from './ChartCard.jsx';
import ChartTooltip from './ChartTooltip.jsx';

/**
 * Vertical bar chart of revenue per product category.
 * @param {{data: Array<{category: string, revenue: number, units: number}>}} props
 */
export default function CategoryRevenueChart({ data }) {
  return (
    <ChartCard title="Revenue by category" subtitle="Which product lines drive sales">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid stroke={GRID_STROKE} vertical={false} />
            <XAxis dataKey="category" interval={0} tickFormatter={(v) => (v.length > 11 ? `${v.slice(0, 10)}…` : v)} {...AXIS_PROPS} />
            <YAxis tickFormatter={formatCompactCurrency} width={56} {...AXIS_PROPS} />
            <Tooltip content={<ChartTooltip formatValue={formatCurrency} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="revenue" name="Revenue" radius={[8, 8, 0, 0]} maxBarSize={44}>
              {data.map((row, index) => (
                <Cell key={row.category} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
