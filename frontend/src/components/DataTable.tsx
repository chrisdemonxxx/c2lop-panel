import React, { useState } from 'react';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  onEdit?: (row: T, key: keyof T, value: any) => void;
  selectedIds?: Array<string | number>;
  onSelectionChange?: (ids: Array<string | number>) => void;
}

export default function DataTable<T extends { id: string | number }>({ columns, data, pageSize = 10, onEdit, selectedIds = [], onSelectionChange }: DataTableProps<T>) {
  // DEBUG: Log when DataTable is rendered
  // eslint-disable-next-line no-console
  console.log('DataTable rendered', { columns, data });
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortAsc]);

  const pagedData = sortedData.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm font-sans bg-[#23272f] rounded-2xl overflow-hidden shadow-[0_0_16px_#00ffae33] border border-[#00ffae]" role="table">
        <thead>
          <tr role="row">
            {onSelectionChange && (
              <th className="px-4 py-3 bg-[#181a20] border-b border-[#00ffae55]">
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={selectedIds.length === pagedData.length && pagedData.length > 0}
                  ref={el => {
                    if (el) el.indeterminate = selectedIds.length > 0 && selectedIds.length < pagedData.length;
                  }}
                  onChange={e => {
                    if (e.target.checked) {
                      onSelectionChange(pagedData.map(row => row.id));
                    } else {
                      onSelectionChange([]);
                    }
                  }}
                  className="accent-[#00ffae] w-4 h-4 rounded focus:ring-2 focus:ring-[#00ffae]"
                />
              </th>
            )}
            {columns.map((col, idx) => (
              <th
                key={String(col.key)}
                className="px-4 py-3 font-extrabold text-[#00ffae] border-b border-[#00ffae55] bg-[#181a20] uppercase tracking-wide text-xs select-none cursor-pointer hover:text-[#00fffa] transition-colors duration-200"
                tabIndex={col.sortable ? 0 : -1}
                role="columnheader"
                aria-sort={sortKey === col.key ? (sortAsc ? 'ascending' : 'descending') : undefined}
                onClick={() => {
                  if (col.sortable) {
                    if (sortKey === col.key) setSortAsc((a) => !a);
                    else setSortKey(col.key);
                  }
                }}
              >
                {col.label}
                {col.sortable && (
                  <span className="ml-1 text-xs">
                    {sortKey === col.key ? (sortAsc ? '▲' : '▼') : ''}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pagedData.map((row, i) => (
            <tr
              key={row.id}
              className={`transition-all duration-200 ${i % 2 === 0 ? 'bg-[#23272f]' : 'bg-[#181a20]'} hover:shadow-[0_0_12px_#00ffae88] hover:bg-[#1b1e24] group ${selectedIds.includes(row.id) ? 'ring-2 ring-[#00ffae]' : ''}`}
            >
              {onSelectionChange && (
                <td className="px-4 py-3 text-[#e6fff7] group-hover:text-[#00ffae] transition-colors duration-200">
                  <input
                    type="checkbox"
                    aria-label={`Select row ${row.id}`}
                    checked={selectedIds.includes(row.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        onSelectionChange([...selectedIds, row.id]);
                      } else {
                        onSelectionChange(selectedIds.filter(id => id !== row.id));
                      }
                    }}
                    className="accent-[#00ffae] w-4 h-4 rounded focus:ring-2 focus:ring-[#00ffae]"
                  />
                </td>
              )}
              {columns.map((col, colIdx) => (
                <td key={String(col.key)} className="px-4 py-3 text-[#e6fff7] group-hover:text-[#00ffae] transition-colors duration-200" role="cell" tabIndex={0}>
                  {col.render
                    ? col.render(row)
                    : (typeof row[col.key] === 'object' && row[col.key] !== null
                        ? JSON.stringify(row[col.key])
                        : String(row[col.key]))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-4 py-2 bg-[#181a20] border border-[#00ffae] rounded-xl text-[#00ffae] font-bold shadow-[0_0_8px_#00ffae66] hover:bg-[#23272f] hover:text-[#00fffa] transition-all duration-200 disabled:opacity-40"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Prev
        </button>
        <span className="text-[#00ffae] font-semibold">Page {page + 1} / {Math.ceil(data.length / pageSize)}</span>
        <button
          className="px-4 py-2 bg-[#181a20] border border-[#00ffae] rounded-xl text-[#00ffae] font-bold shadow-[0_0_8px_#00ffae66] hover:bg-[#23272f] hover:text-[#00fffa] transition-all duration-200 disabled:opacity-40"
          onClick={() => setPage((p) => Math.min(Math.ceil(data.length / pageSize) - 1, p + 1))}
          disabled={page >= Math.ceil(data.length / pageSize) - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
