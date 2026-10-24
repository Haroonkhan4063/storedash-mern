import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * Dashboard KPI tile with an optional period-over-period delta.
 * @param {{
 *   icon: import('react').ComponentType<any>,
 *   label: string,
 *   value: string|number,
 *   accent: string,
 *   change?: number|null,
 *   hint?: string
 * }} props
 */
export default function StatCard({ icon: Icon, label, value, accent, change, hint }) {
  const hasChange = typeof change === 'number';
  const positive = hasChange && change >= 0;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ring-white/10 ${accent}`}>
          <Icon size={20} />
        </span>
        {hasChange && (
          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold ${positive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
            {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-sm text-slate-400">{label}</p>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
