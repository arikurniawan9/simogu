'use client';

import React from 'react';
import { ShieldAlert, ArrowLeft, LogIn, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

interface AccessDeniedProps {
  requiredRole?: string;
  userRole?: string | null;
  message?: string;
}

export function AccessDenied({ requiredRole = 'ADMIN / SUPER ADMIN', userRole, message }: AccessDeniedProps) {
  const getDashboardUrl = () => {
    if (userRole === 'SUPER_ADMIN') return '/superadmin/dashboard';
    if (userRole === 'PIKET') return '/piket/dashboard';
    if (userRole === 'ADMIN') return '/admin/dashboard';
    return '/login';
  };

  return (
    <div className="min-h-screen transition-colors duration-500 flex items-center justify-center p-4 relative">
      {/* Ambient Blobs */}
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      <div className="max-w-md w-full glass-card p-6 sm:p-8 rounded-lg text-center space-y-5 relative z-10 shadow-2xl border border-rose-200 dark:border-rose-900/50">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-lg shadow-rose-600/20">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Akses Ditolak / Dibatasi (403)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {message || `Halaman ini membutuhkan hak akses role [${requiredRole}].`}
          </p>
          {userRole && (
            <div className="pt-1">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Role Anda: {userRole}
              </span>
            </div>
          )}
        </div>

        <div className="pt-3 space-y-2">
          {userRole ? (
            <Link
              href={getDashboardUrl()}
              className="w-full py-2.5 px-4 rounded-md text-xs font-bold bg-brand-600 hover:bg-brand-700 active:scale-95 text-white shadow-md shadow-brand-600/25 transition-all flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" /> Kembali ke Dashboard Saya
            </Link>
          ) : (
            <Link
              href="/login"
              className="w-full py-2.5 px-4 rounded-md text-xs font-bold bg-brand-600 hover:bg-brand-700 active:scale-95 text-white shadow-md shadow-brand-600/25 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Login Sebagai {requiredRole}
            </Link>
          )}

          <Link
            href="/"
            className="w-full py-2 px-4 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Beranda Utama SIMOGU
          </Link>
        </div>
      </div>
    </div>
  );
}
