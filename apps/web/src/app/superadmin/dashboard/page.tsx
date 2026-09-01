'use client';

import React from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Crown,
  Users,
  Shield,
  Server,
  Database,
  Download,
  MessageSquare,
  Activity,
  ArrowLeft,
  FileCheck,
  RefreshCw,
  Sliders,
  CheckCircle2,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { LogoutButton } from '@/components/logout-button';

export default function SuperAdminDashboardPage() {
  return (
    <div className="min-h-screen transition-colors duration-500 p-3 sm:p-6 relative">
      {/* Ambient Blobs */}
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 relative z-10">

        {/* Header Bar */}
        <header className="p-3.5 sm:p-4 glass-card rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link
              href="/superadmin/dashboard"
              className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/25 shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2 truncate">
                Super Admin
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-800">
                  Full Authority
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Pusat Kendali & Tata Kelola Tertinggi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/settings/profile"
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Profil Pengguna"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <ThemeToggle />
            <LogoutButton size="sm" />
          </div>
        </header>

        {/* Executive Super Admin Metrics (2 cols mobile, 4 cols tablet/desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="glass-card p-3.5 sm:p-4 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Admin</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">4</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="glass-card p-3.5 sm:p-4 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Server API</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">99.9%</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0">
              <Server className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="glass-card p-3.5 sm:p-4 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">PostgreSQL</div>
              <div className="text-base sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5 truncate">Online</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0">
              <Database className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="glass-card p-3.5 sm:p-4 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">WhatsApp</div>
              <div className="text-base sm:text-2xl font-black text-brand-600 dark:text-brand-400 mt-0.5 truncate">Cloud API</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600 shrink-0">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Governance Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

          {/* Audit Log Stream */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-600" /> Audit Log Aktivitas Sensitif
              </h3>
              <span className="text-[10px] text-emerald-500 font-bold font-mono">LIVE</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1">
                <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                  <span className="truncate pr-2">[APPROVAL] Status #REQ-102</span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">05:30 WIB</span>
                </div>
                <p className="text-[11px] text-slate-500">Disetujui oleh SuperAdmin. Status guru GRU-002 diubah ke IZIN.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1">
                <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                  <span className="truncate pr-2">[IMPORT_EXCEL] Impor Guru</span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">05:15 WIB</span>
                </div>
                <p className="text-[11px] text-slate-500">Impor 1 data baru dan 1 duplikat dilewati secara transaksional.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1">
                <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                  <span className="truncate pr-2">[SYSTEM] Backup PostgreSQL</span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">00:00 WIB</span>
                </div>
                <p className="text-[11px] text-slate-500">Dump file tersimpan aman di S3 Storage.</p>
              </div>
            </div>
          </div>

          {/* Super Admin Quick Actions */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl space-y-3.5">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3">
              Kontrol Tata Kelola Super Admin
            </h3>

            <div className="space-y-2.5">
              <Link
                href="/admin/teachers"
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-amber-600 truncate">
                    Kelola Pengguna & Hak Akses
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">SuperAdmin, Admin, dan Guru Piket</div>
                </div>
                <Shield className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0 ml-2" />
              </Link>

              <Link
                href="/admin/whatsapp"
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-amber-600 truncate">
                    Meta WhatsApp Cloud API
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">Token Meta Graph & Outbox Logs</div>
                </div>
                <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0 ml-2" />
              </Link>

              <Link
                href="/admin/reports"
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-amber-600 truncate">
                    Ekspor Laporan Audit & Rekapitulasi
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">Format Excel (.xlsx) dan PDF Print</div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0 ml-2" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
