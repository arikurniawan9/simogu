'use client';

import React, { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { DataTable, Column } from '@/components/data-table';
import { Footer } from '@/components/footer';
import { ArrowLeft, BookOpen, Award, CheckCircle2, Calendar, Shield, Filter, User } from 'lucide-react';
import Link from 'next/link';

interface PublicHistoryItem {
  id: string;
  attendanceDate: string;
  className: string;
  periodNumber: number;
  periodTime: string;
  subject: string;
  status: 'PRESENT' | 'PERMISSION' | 'SICK' | 'OFFICIAL_DUTY' | 'ABSENT_PENDING_CONFIRMATION';
  notes?: string;
}

const sampleHistory: PublicHistoryItem[] = [
  { id: 'h-1', attendanceDate: '2026-08-08', className: 'X IPA 1', periodNumber: 1, periodTime: '07:00 - 07:45', subject: 'Matematika', status: 'PRESENT' },
  { id: 'h-2', attendanceDate: '2026-08-07', className: 'X IPA 1', periodNumber: 2, periodTime: '07:45 - 08:30', subject: 'Matematika', status: 'PRESENT' },
  { id: 'h-3', attendanceDate: '2026-08-06', className: 'XI IPA 1', periodNumber: 3, periodTime: '08:30 - 09:15', subject: 'Matematika', status: 'PRESENT' },
  { id: 'h-4', attendanceDate: '2026-08-05', className: 'XII IPA 2', periodNumber: 4, periodTime: '09:30 - 10:15', subject: 'Matematika', status: 'PRESENT' },
];

export default function PublicTeacherDetailPage({ params }: { params: { code: string } }) {
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');

  const filteredHistory = selectedStatus === 'Semua'
    ? sampleHistory
    : sampleHistory.filter((h) => h.status === selectedStatus);

  const columns: Column<PublicHistoryItem>[] = [
    {
      key: 'attendanceDate',
      header: 'Tanggal',
      render: (item) => <span className="font-mono text-xs font-semibold">{item.attendanceDate}</span>,
    },
    {
      key: 'className',
      header: 'Kelas',
      render: (item) => (
        <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
          {item.className}
        </span>
      ),
    },
    {
      key: 'periodNumber',
      header: 'Jam Ke-',
      render: (item) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">Jam {item.periodNumber}</div>
          <div className="text-[11px] font-mono text-slate-400">{item.periodTime}</div>
        </div>
      ),
    },
    { key: 'subject', header: 'Mata Pelajaran' },
    {
      key: 'status',
      header: 'Status Kehadiran',
      render: (item) => {
        const badges: Record<string, { label: string; cls: string }> = {
          PRESENT: { label: 'Hadir', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
          PERMISSION: { label: 'Izin', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
          SICK: { label: 'Sakit', cls: 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
          OFFICIAL_DUTY: { label: 'Tugas Dinas', cls: 'bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200 dark:border-sky-800' },
          ABSENT_PENDING_CONFIRMATION: { label: 'Pending Konfirmasi', cls: 'bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
        };
        const b = badges[item.status] || badges.PRESENT;

        return (
          <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${b.cls}`}>
            {b.label}
          </span>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 p-3 sm:p-6 relative">
      {/* Floating Animated Ambient Blobs */}
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 relative z-10">

        {/* Header Bar */}
        <header className="flex items-center justify-between p-3.5 sm:p-4 glass-card rounded-2xl">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/guru"
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors"
              title="Kembali ke Pencarian"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/25 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
                Profil Pengajar
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                Portal Transparansi Presensi Guru
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Teacher Info & Appreciation Banner */}
        <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-mono font-black text-xs sm:text-sm border border-brand-300/60 dark:border-brand-800 shrink-0 shadow-md">
                {params.code}
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-slate-50 truncate">
                  Drs. Ari Kurniawan, M.Pd.
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <BookOpen className="w-3.5 h-3.5 text-brand-600 shrink-0" /> Mapel: <span className="font-semibold text-slate-700 dark:text-slate-300">Matematika</span>
                </p>
              </div>
            </div>

            {/* Appreciation Badge */}
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-brand-700 text-white rounded-xl shadow-md flex items-center gap-3">
              <Award className="w-7 h-7 text-amber-300 shrink-0" />
              <div>
                <div className="text-xs font-bold">Penghargaan Kehadiran 100%</div>
                <div className="text-[10px] text-emerald-100">Dedikasi dan kehadiran sempurna mengajar siswa</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary Cards (2x2 on mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="glass-card p-3.5 sm:p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Total Hadir</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">4</div>
            </div>
            <CheckCircle2 className="w-6 sm:w-8 h-6 sm:h-8 text-emerald-500 opacity-60" />
          </div>

          <div className="glass-card p-3.5 sm:p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Izin</div>
              <div className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5">0</div>
            </div>
            <Calendar className="w-6 sm:w-8 h-6 sm:h-8 text-amber-500 opacity-60" />
          </div>

          <div className="glass-card p-3.5 sm:p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Sakit</div>
              <div className="text-xl sm:text-2xl font-black text-rose-600 mt-0.5">0</div>
            </div>
            <Shield className="w-6 sm:w-8 h-6 sm:h-8 text-rose-500 opacity-60" />
          </div>

          <div className="glass-card p-3.5 sm:p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[11px] sm:text-xs font-semibold text-slate-500">Tugas Dinas</div>
              <div className="text-xl sm:text-2xl font-black text-sky-600 mt-0.5">0</div>
            </div>
            <BookOpen className="w-6 sm:w-8 h-6 sm:h-8 text-sky-500 opacity-60" />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="glass-card p-2.5 sm:p-3 rounded-xl flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-brand-600 ml-1 shrink-0" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1 shrink-0 hidden sm:inline">Filter:</span>
          {['Semua', 'PRESENT', 'PERMISSION', 'SICK', 'OFFICIAL_DUTY'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedStatus === st
                  ? 'bg-brand-600 text-white shadow-sm font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-50'
              }`}
            >
              {st === 'PRESENT' ? 'Hadir' : st === 'PERMISSION' ? 'Izin' : st === 'SICK' ? 'Sakit' : st === 'OFFICIAL_DUTY' ? 'Tugas Dinas' : 'Semua'}
            </button>
          ))}
        </div>

        {/* Attendance History Table */}
        <div className="glass-card p-4 sm:p-6 rounded-2xl space-y-4">
          <DataTable
            data={filteredHistory}
            columns={columns}
            searchPlaceholder="Cari tanggal, kelas, atau mapel..."
            pageSizeOptions={[5, 10, 20]}
          />
        </div>

        {/* Footer */}
        <Footer />

      </div>
    </div>
  );
}
