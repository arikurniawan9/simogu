'use client';

import React, { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { DataTable, Column } from '@/components/data-table';
import { Footer } from '@/components/footer';
import { Shield, LogIn, LayoutDashboard, Search, ArrowRight, BookOpen, Clock, Sparkles, Smartphone } from 'lucide-react';
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
    <div className="min-h-screen transition-colors duration-500 p-3 sm:p-6 relative">
      {/* Ambient Blobs */}
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 relative z-10">

        {/* Top Header Bar */}
        <header className="flex items-center justify-between p-3.5 sm:p-4 glass-card rounded-2xl">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/25 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
                SIMOGU
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                Sistem Monitoring Kehadiran Guru
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/guru"
              className="hidden xs:flex px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-brand-600" />
              <span>Cari Guru</span>
            </Link>

            {isLoggedIn ? (
              <Link
                href={dashboardUrl}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 active:scale-95 text-white shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 active:scale-95 text-white shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </Link>
            )}

            <ThemeToggle />
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-white shadow-xl shadow-brand-900/20">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-brand-400/20 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-brand-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Presensi Guru Real-Time & Transparan</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight">
              Pemantauan Kehadiran Guru Multi-Jenjang
            </h2>

            <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed max-w-xl">
              Portal keterbukaan data jadwal mengajar & presensi pengajar sekolah (SMP, SMA, dan SMK) yang akurat, terintegrasi, dan mudah diakses dari smartphone.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link
                href="/guru"
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-brand-800 hover:bg-brand-50 shadow-md active:scale-95 transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-brand-600" />
                <span>Cari Status Guru</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {!isLoggedIn && (
                <Link
                  href="/login"
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-800/80 hover:bg-brand-800 text-white border border-brand-500/40 shadow-sm active:scale-95 transition-all flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Petugas / Admin</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Public Attendance Summary Table */}
        <div className="glass-card p-4 sm:p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                Ringkasan Kehadiran Guru Hari Ini
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data publik status jam mengajar pengajar sekolah
              </p>
            </div>
            <Link
              href="/guru"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
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
