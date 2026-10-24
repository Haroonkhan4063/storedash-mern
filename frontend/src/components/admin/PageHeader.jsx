/**
 * Consistent title block for dashboard sections.
 * @param {{title: string, description?: string, actions?: import('react').ReactNode}} props
 */
export default function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-slate-400">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
