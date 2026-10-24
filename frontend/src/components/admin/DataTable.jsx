import { useEffect, useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * @typedef {object} Column
 * @property {string} key Property name, also used as the default sort accessor.
 * @property {string} label Header text.
 * @property {boolean} [sortable=true]
 * @property {'left'|'right'} [align='left']
 * @property {(row: any) => any} [sortValue] Custom accessor returning a string, number or Date.
 * @property {(row: any) => import('react').ReactNode} [render] Custom cell renderer.
 */

const compare = (a, b) => {
  if (a instanceof Date || b instanceof Date) return new Date(a ?? 0) - new Date(b ?? 0);
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true, sensitivity: 'base' });
};

/**
 * Generic sortable, paginated table. Filtering is intentionally the caller's
 * responsibility: pass already-filtered `rows` and render controls via `toolbar`.
 * @param {{
 *   columns: Column[],
 *   rows: any[],
 *   rowKey?: string,
 *   defaultSort?: {key: string, dir: 'asc'|'desc'},
 *   pageSize?: number,
 *   toolbar?: import('react').ReactNode,
 *   emptyMessage?: string,
 *   noun?: string
 * }} props
 */
export default function DataTable({ columns, rows, rowKey = '_id', defaultSort, pageSize = 10, toolbar, emptyMessage = 'No records match the current filters.', noun = 'records' }) {
  const [sort, setSort] = useState(defaultSort ?? null);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column) return rows;
    const accessor = column.sortValue ?? ((row) => row[column.key]);
    const direction = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => direction * compare(accessor(a), accessor(b)));
  }, [rows, columns, sort]);

  useEffect(() => {
    setPage(1);
  }, [rows.length, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount);
  const visible = sorted.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (key) =>
    setSort((previous) => (previous?.key === key ? { key, dir: previous.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  return (
    <div className="glass overflow-hidden rounded-2xl">
      {toolbar && <div className="flex flex-wrap items-center gap-3 border-b border-white/10 p-4">{toolbar}</div>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/[0.03] text-slate-400">
            <tr>
              {columns.map((column) => {
                const sortable = column.sortable !== false;
                const active = sort?.key === column.key;
                const Icon = !active ? ChevronsUpDown : sort.dir === 'asc' ? ChevronUp : ChevronDown;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={`px-4 py-3 font-medium ${column.align === 'right' ? 'text-right' : ''}`}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={`inline-flex items-center gap-1 transition hover:text-white ${active ? 'text-white' : ''}`}
                      >
                        {column.label} <Icon size={14} className={active ? 'text-neon-cyan' : 'opacity-50'} />
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {visible.map((row) => (
              <tr key={row[rowKey]} className="transition hover:bg-white/[0.03]">
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-3 ${column.align === 'right' ? 'text-right' : ''}`}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-slate-500">{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-sm text-slate-400">
        <span>{sorted.length} {noun}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage(current - 1)} disabled={current === 1} className="btn-ghost !px-2.5 !py-1.5" aria-label="Previous page">
            <ChevronLeft size={16} />
          </button>
          <span className="tabular-nums">Page {current} of {pageCount}</span>
          <button type="button" onClick={() => setPage(current + 1)} disabled={current === pageCount} className="btn-ghost !px-2.5 !py-1.5" aria-label="Next page">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
