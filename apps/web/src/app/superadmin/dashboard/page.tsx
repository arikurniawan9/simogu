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
    <div className="min-h-screen transition-colors duration-500 p-4 sm:p-6 relative">
      {/* Ambient Blobs */}
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">

        {/* Header Bar */}
        <header className="flex items-center justify-between p-4 glass-card rounded-lg">
          <div className="flex items-center gap-3">
            <Link
              href="/superadmin/dashboard"
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/25">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
                Dashboard Super Admin
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800">
                  Full Authority
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pusat kendali tertinggi sistem, manajemen user & hak akses, audit log, dan integrasi API
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/settings/profile"
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Profil Pengguna"
            >
              <User className="w-5 h-5" />
            </Link>
            <ThemeToggle />
            <LogoutButton size="sm" />
          </div>
        </header>

        {/* Executive Super Admin Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total User Admin</div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">4</div>
            </div>
            <div className="w-10 h-10 rounded-md bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600">
              <Shield className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status Server API</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">99.9%</div>
            </div>
            <div className="w-10 h-10 rounded-md bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <Server className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Database PostgreSQL</div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">Connected</div>
            </div>
            <div className="w-10 h-10 rounded-md bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
              <Database className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">WhatsApp Gateway</div>
              <div className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">Cloud API</div>
            </div>
            <div className="w-10 h-10 rounded-md bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Governance Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Audit Log Stream */}
          <div className="glass-card p-6 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-600" /> Audit Log Aktivitas Sensitif (Asia/Jakarta)
              </h3>
              <span className="text-xs text-slate-400 font-mono">Live</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-md text-xs space-y-1">
                <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                  <span>[APPROVAL] Persetujuan Perubahan Status #REQ-102</span>
                  <span className="text-[10px] text-slate-400 font-mono">05:30 WIB</span>
                </div>
                <p className="text-[11px] text-slate-500">Disetujui oleh SuperAdmin (admintoko). Status guru GRU-002 diubah ke IZIN.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-md text-xs space-y-1">
                <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                  <span>[IMPORT_EXCEL] Impor Massal Data Guru</span>
                  <span className="text-[10px] text-slate-400 font-mono">05:15 WIB</span>
                </div>
                <p className="text-[11px] text-slate-500">Impor 1 data baru dan 1 duplikat dilewati secara transaksional.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-md text-xs space-y-1">
                <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                  <span>[SYSTEM] Backup Database Postgres Berhasil</span>
                  <span className="text-[10px] text-slate-400 font-mono">00:00 WIB</span>
                </div>
                <p className="text-[11px] text-slate-500">Dump file `simogu_backup_20260809.sql.gz` disimpan aman di S3 Storage.</p>
              </div>
            </div>
          </div>

          {/* Super Admin Quick Actions */}
          <div className="glass-card p-6 rounded-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3">
              Kontrol Tata Kelola Super Admin
            </h3>

            <div className="space-y-3">
              <Link
                href="/admin/teachers"
                className="p-3 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-amber-600">
                    Kelola Pengguna & Hak Akses Role
                  </div>
                  <div className="text-[11px] text-slate-500">Atur kredensial SuperAdmin, Admin, dan Guru Piket</div>
                </div>
                <Shield className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
              </Link>

              <Link
                href="/admin/whatsapp"
                className="p-3 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-amber-600">
                    Pengaturan Meta WhatsApp Cloud API
                  </div>
                  <div className="text-[11px] text-slate-500">Token Meta Graph, Phone Number ID, & Outbox Logs</div>
                </div>
                <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
              </Link>

              <Link
                href="/admin/reports"
                className="p-3 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-amber-600">
                    Ekspor Laporan Audit & Rekapitulasi
                  </div>
                  <div className="text-[11px] text-slate-500">Unduh data rekap ke format Excel (.xlsx) dan PDF Print</div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
