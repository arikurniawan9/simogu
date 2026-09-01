'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, LayoutGrid, Table as TableIcon } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  pageSizeOptions?: number[];
  isLoading?: boolean;
  rowClassName?: (item: T) => string;
  defaultMobileView?: 'cards' | 'table';
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = 'Cari data...',
  searchFields,
  pageSizeOptions = [5, 10, 20, 50],
  isLoading = false,
  rowClassName,
  defaultMobileView = 'table',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0] || 10);
  const [mobileView, setMobileView] = useState<'cards' | 'table'>(defaultMobileView);

  // Filter Data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      if (searchFields && searchFields.length > 0) {
        return searchFields.some((field) =>
          String(item[field] ?? '')
            .toLowerCase()
            .includes(query),
        );
      }
      return Object.values(item).some((val) =>
        String(val ?? '')
          .toLowerCase()
          .includes(query),
      );
    });
  }, [data, searchQuery, searchFields]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="w-full space-y-3.5">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white/80 dark:bg-surface-cardDark/80 p-3 rounded-xl border border-slate-200/80 dark:border-surface-borderDark shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-600 dark:text-brand-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 justify-between sm:justify-end">
          {/* Mobile View Toggle (Cards vs Table) */}
          <div className="flex sm:hidden items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setMobileView('table')}
              className={`p-1.5 rounded-md transition-all ${
                mobileView === 'table'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Tampilan Tabel"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMobileView('cards')}
              className={`p-1.5 rounded-md transition-all ${
                mobileView === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Tampilan Kartu Mobile"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-500" />
            <span className="hidden sm:inline">Tampilkan</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} baris
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* MOBILE CARD VIEW (when on mobile & cards mode selected) */}
      <div className={`sm:hidden space-y-3 ${mobileView === 'cards' ? 'block' : 'hidden'}`}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white dark:bg-surface-cardDark border border-slate-200 dark:border-surface-borderDark animate-pulse space-y-2">
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
            </div>
          ))
        ) : paginatedData.length > 0 ? (
          paginatedData.map((item, rowIdx) => (
            <div
              key={rowIdx}
              className={`p-4 rounded-xl bg-white dark:bg-surface-cardDark border border-slate-200 dark:border-surface-borderDark shadow-sm space-y-2.5 ${
                rowClassName ? rowClassName(item) : ''
              }`}
            >
              {columns.map((col) => (
                <div key={col.key} className="flex items-start justify-between gap-2 text-xs border-b border-slate-100 dark:border-slate-800/60 pb-1.5 last:border-0 last:pb-0">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                    {col.header}
                  </span>
                  <div className="text-right text-slate-800 dark:text-slate-200 font-medium">
                    {col.render ? col.render(item) : item[col.key]}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white dark:bg-surface-cardDark rounded-xl border border-slate-200 dark:border-surface-borderDark text-slate-400">
            <p className="text-sm font-semibold">Tidak ada data ditemukan</p>
            <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian Anda</p>
          </div>
        )}
      </div>

      {/* Main Responsive Table (Always on desktop, conditional on mobile) */}
      <div className={`overflow-x-auto rounded-xl border border-slate-200/80 dark:border-surface-borderDark bg-white/90 dark:bg-surface-cardDark/90 shadow-sm ${mobileView === 'cards' ? 'hidden sm:block' : 'block'}`}>
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-surface-borderDark text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {columns.map((col) => (
                <th key={col.key} className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 sm:px-5 py-3.5">
                      <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={`hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition-colors duration-150 group ${rowClassName ? rowClassName(item) : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 sm:px-5 py-3.5 text-slate-700 dark:text-slate-200">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-slate-400 dark:text-slate-500"
                >
                  <p className="text-sm font-semibold">Tidak ada data ditemukan</p>
                  <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian Anda</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-1 text-xs text-slate-500 dark:text-slate-400">
        <div className="text-center sm:text-left text-[11px] sm:text-xs">
          Menampilkan{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </span>{' '}
          hingga{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {Math.min(currentPage * pageSize, filteredData.length)}
          </span>{' '}
          dari{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {filteredData.length}
          </span>{' '}
          data
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-semibold text-slate-700 dark:text-slate-300">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Halaman Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
