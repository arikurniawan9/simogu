'use client';

import React, { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { DataTable, Column } from '@/components/data-table';
import { Footer } from '@/components/footer';
import { Shield, LogIn, LayoutDashboard, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PublicTeacherAttendance {
  id: string;
  code: string;
  name: string;
  subject: string;
  status: string;
  timeSlot: string;
}

const publicTeachersList: PublicTeacherAttendance[] = [
  { id: '1', code: 'GRU-001', name: 'Drs. Ari Kurniawan, M.Pd.', subject: 'Matematika', status: 'Hadir', timeSlot: '07:00 - 08:30 (Jam 1-2)' },
  { id: '2', code: 'GRU-002', name: 'Siti Rahma, S.Pd.', subject: 'Bahasa Indonesia', status: 'Izin', timeSlot: '08:30 - 10:00 (Jam 3-4)' },
  { id: '3', code: 'GRU-003', name: 'Budi Santoso, S.T.', subject: 'Fisika', status: 'Sakit', timeSlot: '07:00 - 08:30 (Jam 1-2)' },
  { id: '4', code: 'GRU-004', name: 'Dewi Lestari, M.Sc.', subject: 'Biologi', status: 'Hadir', timeSlot: '10:15 - 11:45 (Jam 5-6)' },
  { id: '5', code: 'GRU-005', name: 'Ahmad Fauzi, S.Ag.', subject: 'Pendidikan Agama', status: 'Tugas Dinas', timeSlot: '08:30 - 10:00 (Jam 3-4)' },
  { id: '6', code: 'GRU-006', name: 'Rina Wijaya, S.Kom.', subject: 'Informatika', status: 'Hadir', timeSlot: '10:15 - 11:45 (Jam 5-6)' },
];

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState('/login');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('simogu_token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('simogu_user') : null;

    if (token) {
      setIsLoggedIn(true);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'SUPER_ADMIN') {
            setDashboardUrl('/superadmin/dashboard');
          } else if (user.role === 'PIKET') {
            setDashboardUrl('/piket/dashboard');
          } else {
            setDashboardUrl('/admin/dashboard');
          }
        } catch {
          setDashboardUrl('/admin/dashboard');
        }
      } else {
        setDashboardUrl('/admin/dashboard');
      }
    }
  }, []);

  const tableColumns: Column<PublicTeacherAttendance>[] = [
    {
      key: 'code',
      header: 'Kode Guru',
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-brand-700 dark:text-brand-300">
          {item.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Nama Pengajar',
      render: (item) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</span>
      ),
    },
    { key: 'subject', header: 'Mata Pelajaran' },
    { key: 'timeSlot', header: 'Jam Mengajar' },
    {
      key: 'status',
      header: 'Status Kehadiran',
      render: (item) => {
        const badgeColors: Record<string, string> = {
          Hadir: 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          Izin: 'bg-amber-50/90 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          Sakit: 'bg-rose-50/90 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          'Tugas Dinas': 'bg-sky-50/90 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200 dark:border-sky-800',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${badgeColors[item.status] || ''}`}>
            {item.status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 p-4 sm:p-6 relative">
      {/* Ambient Blobs */}
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">

        {/* Top Header Bar */}
        <header className="flex items-center justify-between p-4 glass-card rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                SIMOGU
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sistem Monitoring Kehadiran Guru Terpadu
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/guru"
              className="px-3.5 py-2 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-brand-600" /> Cari Guru
            </Link>
            {isLoggedIn ? (
              <Link
                href={dashboardUrl}
                className="px-3.5 py-2 rounded-md text-xs font-bold bg-brand-600 hover:bg-brand-700 active:scale-95 text-white shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-md text-xs font-bold bg-brand-600 hover:bg-brand-700 active:scale-95 text-white shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" /> Masuk Akun
              </Link>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 rounded-lg p-8 sm:p-12 text-white shadow-xl shadow-brand-900/20">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-brand-400/20 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-4 max-w-2xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight">
              Pemantauan Kehadiran Guru Transparan & Real-Time
            </h2>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/guru"
                className="px-4 py-2.5 rounded-md text-xs font-bold bg-white text-brand-800 hover:bg-brand-50 shadow-md active:scale-95 transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4" /> Cari Status Guru <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Public Attendance Summary Table */}
        <div className="glass-card p-5 sm:p-6 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                Ringkasan Kehadiran Guru Hari Ini
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data publik status jam mengajar pengajar sekolah
              </p>
            </div>
            <Link
              href="/guru"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              Lihat Portal Pencarian Lengkap <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <DataTable
            data={publicTeachersList}
            columns={tableColumns}
            searchPlaceholder="Cari kode atau nama guru di daftar publik..."
            pageSizeOptions={[5, 10]}
          />
        </div>

        {/* Global Footer */}
        <Footer />

      </div>
    </div>
  );
}
