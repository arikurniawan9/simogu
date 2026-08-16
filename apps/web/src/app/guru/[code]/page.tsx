'use client';

import React, { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { DataTable, Column } from '@/components/data-table';
import { ArrowLeft, BookOpen, Award, CheckCircle2, Calendar, Shield, Filter } from 'lucide-react';
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
    <div className="min-h-screen transition-colors duration-500 p-4 sm:p-6 relative">
      {/* Floating Animated Ambient Blobs */}
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">

        {/* Header Bar */}
        <header className="flex items-center justify-between p-4 glass-card rounded-lg">
          <div className="flex items-center gap-3">
            <Link
              href="/guru"
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                Profil & Riwayat Guru
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Portal Transparansi Publik Kehadiran Guru
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        {/* Teacher Info & Appreciation Banner */}
        <div className="glass-card p-6 rounded-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-mono font-black text-sm border border-brand-300/60 dark:border-brand-800">
                {params.code}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  Drs. Ari Kurniawan, M.Pd.
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                  <BookOpen className="w-4 h-4 text-brand-600" /> Mata Pelajaran: <span className="font-semibold text-slate-700 dark:text-slate-300">Matematika</span>
                </p>
              </div>
            </div>

            {/* Appreciation Badge */}
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-brand-700 text-white rounded-lg shadow-md flex items-center gap-3 max-w-sm">
              <Award className="w-8 h-8 text-amber-300 shrink-0" />
              <div>
                <div className="text-xs font-bold">Penghargaan Kehadiran 100%</div>
                <div className="text-[11px] text-emerald-100">Terima kasih atas dedikasi dan kehadiran sempurna mengajar siswa!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Total Hadir</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">4</div>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-60" />
          </div>

          <div className="glass-card p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Izin</div>
              <div className="text-2xl font-black text-amber-600 mt-1">0</div>
            </div>
            <Calendar className="w-8 h-8 text-amber-500 opacity-60" />
          </div>

          <div className="glass-card p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Sakit</div>
              <div className="text-2xl font-black text-rose-600 mt-1">0</div>
            </div>
            <Shield className="w-8 h-8 text-rose-500 opacity-60" />
          </div>

          <div className="glass-card p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Tugas Dinas</div>
              <div className="text-2xl font-black text-sky-600 mt-1">0</div>
            </div>
            <BookOpen className="w-8 h-8 text-sky-500 opacity-60" />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="glass-card p-3 rounded-lg flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-brand-600 ml-2" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-2">Filter Status:</span>
          {['Semua', 'PRESENT', 'PERMISSION', 'SICK', 'OFFICIAL_DUTY'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                selectedStatus === st
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-50'
              }`}
            >
              {st === 'PRESENT' ? 'Hadir' : st === 'PERMISSION' ? 'Izin' : st === 'SICK' ? 'Sakit' : st === 'OFFICIAL_DUTY' ? 'Tugas Dinas' : 'Semua'}
            </button>
          ))}
        </div>

        {/* Attendance History Table */}
        <div className="glass-card p-5 sm:p-6 rounded-lg space-y-4">
          <DataTable
            data={filteredHistory}
            columns={columns}
            searchPlaceholder="Cari tanggal, kelas, atau mapel..."
            pageSizeOptions={[5, 10, 20]}
          />
        </div>

      </div>
    </div>
  );
}
