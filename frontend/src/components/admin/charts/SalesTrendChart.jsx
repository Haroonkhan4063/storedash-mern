import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatCompactCurrency, formatCurrency, formatShortDate } from '../../../lib/format.js';
import { AXIS_PROPS, GRID_STROKE } from './palette.js';
import ChartCard from './ChartCard.jsx';
import ChartTooltip from './ChartTooltip.jsx';

const METRICS = {
  revenue: { label: 'Revenue', color: '#8b5cf6', axis: formatCompactCurrency, tooltip: formatCurrency },
  orders: { label: 'Orders', color: '#22d3ee', axis: (v) => v, tooltip: (v) => v },
};

/**
 * Daily trend line with a revenue / orders metric switch.
 * @param {{data: Array<{date: string, revenue: number, orders: number}>}} props
 */
export default function SalesTrendChart({ data }) {
  const [metric, setMetric] = useState('revenue');
  const config = METRICS[metric];

  const switcher = (
    <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.04] p-0.5" role="group" aria-label="Chart metric">
      {Object.entries(METRICS).map(([key, { label }]) => (
        <button
          key={key}
          type="button"
          onClick={() => setMetric(key)}
          aria-pressed={metric === key}
          className={`rounded-md px-3 py-1 text-xs font-semibold transition ${metric === key ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <ChartCard title="Sales trend" subtitle="Daily performance, excluding cancelled orders" actions={switcher} className="lg:col-span-2">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid stroke={GRID_STROKE} vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatShortDate} interval="preserveStartEnd" minTickGap={28} {...AXIS_PROPS} />
            <YAxis tickFormatter={config.axis} width={56} allowDecimals={false} {...AXIS_PROPS} />
            <Tooltip content={<ChartTooltip formatLabel={formatShortDate} formatValue={config.tooltip} />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
            <Line type="monotone" dataKey={metric} name={config.label} stroke={config.color} strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
