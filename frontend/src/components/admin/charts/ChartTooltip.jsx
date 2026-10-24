/**
 * Dark glass tooltip compatible with Recharts' `content` prop.
 * @param {{
 *   active?: boolean,
 *   payload?: Array<any>,
 *   label?: string,
 *   formatLabel?: (label: string) => string,
 *   formatValue?: (value: number, name: string) => string
 * }} props
 */
export default function ChartTooltip({ active, payload, label, formatLabel, formatValue }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-strong rounded-xl px-3.5 py-2.5 text-sm shadow-xl">
      {label !== undefined && <p className="mb-1 font-medium text-white">{formatLabel ? formatLabel(label) : label}</p>}
      {payload.map((entry) => (
        <p key={entry.dataKey ?? entry.name} className="flex items-center gap-2 text-slate-300">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color || entry.payload?.fill }} />
          <span className="capitalize">{entry.name}</span>
          <span className="ml-auto pl-4 font-semibold text-white">{formatValue ? formatValue(entry.value, entry.name) : entry.value}</span>
        </p>
      ))}
    </div>
  );
}
