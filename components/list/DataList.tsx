'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Filter, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef<T> {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: { label: string; value: string }[];
  width?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface DataListProps<T> {
  title?: string;
  data: T[];
  columns: ColumnDef<T>[];
  /** Global search placeholder */
  searchPlaceholder?: string;
  /** Key to use for row identity */
  rowKey?: keyof T | ((row: T) => string);
  /** Rows per page options */
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  /** Show export button */
  onExport?: () => void;
  /** Extra toolbar content (right side) */
  toolbar?: React.ReactNode;
  /** Empty state message */
  emptyMessage?: string;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  className?: string;
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === 'asc') return <ChevronUp className="h-3.5 w-3.5 text-emerald-600" />;
  if (direction === 'desc') return <ChevronDown className="h-3.5 w-3.5 text-emerald-600" />;
  return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-300" />;
}

// ─── Column filter dropdown ───────────────────────────────────────────────────

function ColumnFilter({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className={`p-0.5 rounded transition-colors ${value !== 'all' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
        aria-label="Filter column"
      >
        <Filter className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl min-w-[140px] overflow-hidden">
            {[{ label: 'All', value: 'all' }, ...options].map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  value === opt.value
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── DataList ─────────────────────────────────────────────────────────────────

export function DataList<T extends Record<string, any>>({
  title,
  data,
  columns,
  searchPlaceholder = 'Search...',
  rowKey,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 25,
  onExport,
  toolbar,
  emptyMessage = 'No data found.',
  onRowClick,
  className = '',
}: DataListProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Global sort dropdown
  const [globalSort, setGlobalSort] = useState('newest');
  const [globalSortOpen, setGlobalSortOpen] = useState(false);
  const [globalFilterOpen, setGlobalFilterOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('all');

  const filterableColumns = columns.filter(c => c.filterable && c.filterOptions?.length);

  // Derive global filter options from first filterable column with options
  const globalFilterOptions = filterableColumns[0]?.filterOptions ?? [];

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc');
      if (sortDir === 'desc') setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  function setColumnFilter(key: string, value: string) {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }

  const processed = useMemo(() => {
    let rows = [...data];

    // Global search
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(row =>
        columns.some(col => {
          const val = row[col.key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }

    // Global filter (first filterable column)
    if (globalFilter !== 'all' && filterableColumns[0]) {
      const key = filterableColumns[0].key;
      rows = rows.filter(row => String(row[key]) === globalFilter);
    }

    // Column-level filters
    Object.entries(columnFilters).forEach(([key, val]) => {
      if (val && val !== 'all') {
        rows = rows.filter(row => String(row[key]) === val);
      }
    });

    // Sort
    if (sortKey && sortDir) {
      rows.sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    } else if (globalSort === 'oldest') {
      rows.sort((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime());
    } else {
      rows.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
    }

    return rows;
  }, [data, search, globalFilter, columnFilters, sortKey, sortDir, globalSort, columns, filterableColumns]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const paginated = processed.slice((page - 1) * pageSize, page * pageSize);

  function getRowKey(row: T, i: number): string {
    if (!rowKey) return String(i);
    if (typeof rowKey === 'function') return rowKey(row);
    return String(row[rowKey]);
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-600 text-gray-800 dark:text-gray-200 placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Global filter dropdown */}
          {globalFilterOptions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setGlobalFilterOpen(o => !o)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Filter className="h-3.5 w-3.5" />
                {globalFilter === 'all' ? (filterableColumns[0]?.title ?? 'Filter') : globalFilterOptions.find(o => o.value === globalFilter)?.label ?? globalFilter}
                <ChevronDown className="h-3 w-3" />
              </button>
              {globalFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setGlobalFilterOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl min-w-[160px] overflow-hidden">
                    {[{ label: `All ${filterableColumns[0]?.title ?? ''}`, value: 'all' }, ...globalFilterOptions].map(opt => (
                      <button key={opt.value} onClick={() => { setGlobalFilter(opt.value); setGlobalFilterOpen(false); setPage(1); }}
                        className={`w-full text-left px-3 py-2.5 text-xs transition-colors ${globalFilter === opt.value ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setGlobalSortOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronsUpDown className="h-3.5 w-3.5" />
              {globalSort === 'newest' ? 'Newest First' : 'Oldest First'}
              <ChevronDown className="h-3 w-3" />
            </button>
            {globalSortOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setGlobalSortOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl min-w-[140px] overflow-hidden">
                  {[{ label: 'Newest First', value: 'newest' }, { label: 'Oldest First', value: 'oldest' }].map(opt => (
                    <button key={opt.value} onClick={() => { setGlobalSort(opt.value); setGlobalSortOpen(false); setPage(1); }}
                      className={`w-full text-left px-3 py-2.5 text-xs transition-colors ${globalSort === opt.value ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export */}
          {onExport && (
            <button onClick={onExport}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Export">
              <Download className="h-4 w-4" />
            </button>
          )}

          {toolbar}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
              {columns.map(col => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={col.sortable ? 'cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors' : ''}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      {col.title}
                    </span>
                    {col.sortable && (
                      <span className="cursor-pointer" onClick={() => handleSort(col.key)}>
                        <SortIcon direction={sortKey === col.key ? sortDir : null} />
                      </span>
                    )}
                    {col.filterable && col.filterOptions?.length && (
                      <ColumnFilter
                        options={col.filterOptions}
                        value={columnFilters[col.key] ?? 'all'}
                        onChange={v => setColumnFilter(col.key, v)}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={getRowKey(row, i)}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10' : 'hover:bg-gray-50/60 dark:hover:bg-gray-800/40'
                  }`}
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row, i) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between mt-3 px-1">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, processed.length)} of {processed.length}</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <div className="flex items-center gap-1">
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="text-xs bg-transparent border-none outline-none cursor-pointer text-gray-500 dark:text-gray-400"
            >
              {pageSizeOptions.map(s => <option key={s} value={s}>{s} per page</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataList;
