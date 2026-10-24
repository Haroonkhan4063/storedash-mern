/**
 * Titled container for a chart with an optional control slot.
 * @param {{title: string, subtitle?: string, actions?: import('react').ReactNode, className?: string, children: import('react').ReactNode}} props
 */
export default function ChartCard({ title, subtitle, actions, className = '', children }) {
  return (
    <section className={`glass rounded-2xl p-5 ${className}`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
