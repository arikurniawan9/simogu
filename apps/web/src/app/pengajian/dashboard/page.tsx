'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogoutButton } from '@/components/logout-button';
import { Footer } from '@/components/footer';
import {
  BookOpen,
  Building2,
  Clock,
  Sun,
  Sunset,
  Moon,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  Calendar,
  Layers,
  MapPin,
  Sparkles,
  ArrowLeftRight,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface PengajianSessionStat {
  total: number;
  present: number;
  sick: number;
  permission: number;
  unrecorded: number;
}

interface PengajianRecordItem {
  scheduleId: string;
  session: 'PAGI' | 'ASHAR' | 'MAGHRIB';
  timeSlot: string;
  kitab: string;
  halaqah: { id: string; name: string; category: string; location?: string };
  teacher: { id: string; fullName: string };
  status: string | null;
  badalTeacherName?: string | null;
  notes?: string | null;
}

export default function PengajianDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeSessionTab, setActiveSessionTab] = useState<'ALL' | 'PAGI' | 'ASHAR' | 'MAGHRIB'>('ALL');
  const [currentHourSession, setCurrentHourSession] = useState<'PAGI' | 'ASHAR' | 'MAGHRIB' | 'ISTIRAHAT'>('PAGI');

  const [stats, setStats] = useState({
    totalClasses: 5,
    totalSchedules: 15,
    today: { total: 15, present: 13, absent: 2, pending: 0, attendanceRate: 87 },
    sessions: {
      PAGI: { total: 5, present: 5, sick: 0, permission: 0, unrecorded: 0 } as PengajianSessionStat,
      ASHAR: { total: 5, present: 4, sick: 0, permission: 1, unrecorded: 0 } as PengajianSessionStat,
      MAGHRIB: { total: 5, present: 4, sick: 1, permission: 0, unrecorded: 0 } as PengajianSessionStat,
    },
  });

  const [records, setRecords] = useState<PengajianRecordItem[]>([
    {
      scheduleId: 's-1',
      session: 'PAGI',
      timeSlot: '05:30 - 06:30 (Ba\'da Subuh)',
      kitab: 'Al-Jurumiyah (Nahwu Dasar)',
      halaqah: { id: 'c-1', name: 'Halaqah Al-Jurumiyah A', category: 'Kitab Kuning', location: 'Masjid Utama Lt. 1' },
      teacher: { id: 't-1', fullName: 'Ust. Ahmad Fauzi, S.Ag.' },
      status: 'PRESENT',
    },
    {
      scheduleId: 's-2',
      session: 'PAGI',
      timeSlot: '05:30 - 06:30 (Ba\'da Subuh)',
      kitab: 'Tahfidz Juz 30 & Tahsin',
      halaqah: { id: 'c-2', name: 'Halaqah Tahfidz Al-Qur\'an', category: 'Tahfidz', location: 'Gedung Tahfidz Lt. 1' },
      teacher: { id: 't-2', fullName: 'Ust. Ridwan Kamil, S.Pd.I' },
      status: 'PRESENT',
    },
    {
      scheduleId: 's-3',
      session: 'ASHAR',
      timeSlot: '16:00 - 17:00 (Ba\'da Ashar)',
      kitab: 'Safinatun Najah (Fiqih)',
      halaqah: { id: 'c-3', name: 'Halaqah Safinatun Najah', category: 'Diniyah', location: 'Asrama Putra Al-Ghazali' },
      teacher: { id: 't-3', fullName: 'Ust. Budi Santoso, S.T.' },
      status: 'PERMISSION',
      badalTeacherName: 'Ust. Zulkifli (Badal)',
      notes: 'Izin tugas luar pesantren',
    },
    {
      scheduleId: 's-4',
      session: 'ASHAR',
      timeSlot: '16:00 - 17:00 (Ba\'da Ashar)',
      kitab: 'Riyadhus Shalihin (Hadits)',
      halaqah: { id: 'c-4', name: 'Halaqah Riyadhus Shalihin', category: 'Hadits', location: 'Aula Utama' },
      teacher: { id: 't-4', fullName: 'K.H. Syamsul Arifin, Lc.' },
      status: 'PRESENT',
    },
    {
      scheduleId: 's-5',
      session: 'MAGHRIB',
      timeSlot: '18:30 - 19:45 (Ba\'da Maghrib)',
      kitab: 'Fathul Qorib Al-Mujib',
      halaqah: { id: 'c-5', name: 'Halaqah Fathul Qorib', category: 'Kitab Kuning', location: 'Masjid Utama Lt. 2' },
      teacher: { id: 't-5', fullName: 'Drs. Ari Kurniawan, M.Pd.' },
      status: 'PRESENT',
    },
    {
      scheduleId: 's-6',
      session: 'MAGHRIB',
      timeSlot: '18:30 - 19:45 (Ba\'da Maghrib)',
      kitab: 'Nadhom Al-Imrithi',
      halaqah: { id: 'c-6', name: 'Halaqah Imrithi & Shorof', category: 'Kitab Kuning', location: 'Gedung Diniyah A' },
      teacher: { id: 't-6', fullName: 'Siti Rahma, S.Pd.' },
      status: 'SICK',
      notes: 'Sakit istirahat di rumah dinas',
    },
  ]);

  useEffect(() => {
    // Determine active time session in WIB
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) {
      setCurrentHourSession('PAGI');
    } else if (hour >= 15 && hour < 18) {
      setCurrentHourSession('ASHAR');
    } else if (hour >= 18 && hour < 21) {
      setCurrentHourSession('MAGHRIB');
    } else {
      setCurrentHourSession('ISTIRAHAT');
    }

    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('simogu_user');
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch {
          // ignore
        }
      }
    }

    async function loadData() {
      try {
        const statsRes = await apiClient.get<any>('/api/v1/pengajian/dashboard/stats');
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }

        const summaryRes = await apiClient.get<any>('/api/v1/pengajian/attendance/today-summary');
        if (summaryRes.success && summaryRes.data?.records && Array.isArray(summaryRes.data.records) && summaryRes.data.records.length > 0) {
          setRecords(summaryRes.data.records);
        }
      } catch {
        // use fallback initial data
      }
    }

    loadData();
  }, []);

  const filteredRecords = activeSessionTab === 'ALL'
    ? records
    : records.filter((r) => r.session === activeSessionTab);

  return (
    <div className="min-h-screen transition-colors duration-500 p-3 sm:p-6 relative">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 relative z-10">

        {/* Top Header Card with Context Switcher */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between p-4 glass-card rounded-2xl gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
                  SIMOGU Pesantren
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                  Pengajian Mode
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dashboard Monitoring Presensi Pengajian Kitab (Pagi, Ashar, Maghrib)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Button to Switch to Sekolah Formal */}
            <Link
              href="/admin/dashboard"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5 active:scale-95"
              title="Beralih ke Dashboard Sekolah Formal"
            >
              <Building2 className="w-3.5 h-3.5 text-brand-600" />
              <span>Beralih ke Sekolah Formal</span>
            </Link>

            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        {/* Operational Session Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Status Waktu Saat Ini
              </div>
              <div className="text-base sm:text-lg font-extrabold text-white">
                {currentHourSession === 'PAGI' && '🌅 Sesi Ba\'da Subuh (Pagi) Sedang Berjalan'}
                {currentHourSession === 'ASHAR' && '☀️ Sesi Ba\'da Ashar Sedang Berjalan'}
                {currentHourSession === 'MAGHRIB' && '🌙 Sesi Ba\'da Maghrib Sedang Berjalan'}
                {currentHourSession === 'ISTIRAHAT' && '🏫 Sesi Istirahat Pengajian (Jam Formal Sekolah)'}
              </div>
              <p className="text-xs text-emerald-100/90">
                Piket pengajian dapat langsung menginput presensi ustadz pada tombol aksi di bawah.
              </p>
            </div>
          </div>

          <Link
            href="/pengajian/attendance"
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 self-start md:self-auto shrink-0"
          >
            <Clock className="w-4 h-4" />
            <span>Catat Presensi Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Quick Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/pengajian/attendance"
            className="glass-card p-4 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition-all group block space-y-2 border border-slate-200 dark:border-slate-800"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-50 flex items-center justify-between">
                <span>Presensi Pengajian</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Input kehadiran Ustadz per sesi (Pagi, Ashar, Maghrib)
              </p>
            </div>
          </Link>

          <Link
            href="/pengajian/classes"
            className="glass-card p-4 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition-all group block space-y-2 border border-slate-200 dark:border-slate-800"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-50 flex items-center justify-between">
                <span>Halaqah & Kelas</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelola kelompok halaqah, kitab, dan ruang santri
              </p>
            </div>
          </Link>

          <Link
            href="/pengajian/teachers"
            className="glass-card p-4 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition-all group block space-y-2 border border-slate-200 dark:border-slate-800"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-50 flex items-center justify-between">
                <span>Data Ustadz / Guru</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daftar pengajar kitab & kontak WhatsApp
              </p>
            </div>
          </Link>

          <Link
            href="/pengajian/schedules"
            className="glass-card p-4 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition-all group block space-y-2 border border-slate-200 dark:border-slate-800"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-50 flex items-center justify-between">
                <span>Jadwal Pengajian</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur jadwal mingguan untuk 3 waktu pengajian
              </p>
            </div>
          </Link>
        </div>

        {/* Statistics Cards per Session */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Card PAGI */}
          <div className="glass-card p-4 rounded-2xl space-y-2 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  SESI 1: PAGI (Subuh)
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                05:30 - 06:30
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {stats.sessions.PAGI.present} / {stats.sessions.PAGI.total}
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Tingkat Kehadiran:</span>
              <span className="font-bold text-emerald-600">
                {stats.sessions.PAGI.total > 0 ? Math.round((stats.sessions.PAGI.present / stats.sessions.PAGI.total) * 100) : 100}%
              </span>
            </div>
          </div>

          {/* Card ASHAR */}
          <div className="glass-card p-4 rounded-2xl space-y-2 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sunset className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  SESI 2: ASHAR
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-300">
                16:00 - 17:00
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {stats.sessions.ASHAR.present} / {stats.sessions.ASHAR.total}
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Tingkat Kehadiran:</span>
              <span className="font-bold text-emerald-600">
                {stats.sessions.ASHAR.total > 0 ? Math.round((stats.sessions.ASHAR.present / stats.sessions.ASHAR.total) * 100) : 100}%
              </span>
            </div>
          </div>

          {/* Card MAGHRIB */}
          <div className="glass-card p-4 rounded-2xl space-y-2 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  SESI 3: MAGHRIB
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                18:30 - 19:45
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {stats.sessions.MAGHRIB.present} / {stats.sessions.MAGHRIB.total}
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Tingkat Kehadiran:</span>
              <span className="font-bold text-emerald-600">
                {stats.sessions.MAGHRIB.total > 0 ? Math.round((stats.sessions.MAGHRIB.present / stats.sessions.MAGHRIB.total) * 100) : 100}%
              </span>
            </div>
          </div>
        </div>

        {/* Live Attendance Table */}
        <div className="glass-card p-4 sm:p-6 rounded-2xl space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Daftar Presensi Pengajian Hari Ini
              </h2>
              <p className="text-xs text-slate-500">
                Pantau status kehadiran ustadz dan ustadz badal secara real-time
              </p>
            </div>

            {/* Session Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveSessionTab('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeSessionTab === 'ALL' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
              >
                Semua Sesi
              </button>
              <button
                type="button"
                onClick={() => setActiveSessionTab('PAGI')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeSessionTab === 'PAGI' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
              >
                🌅 PAGI
              </button>
              <button
                type="button"
                onClick={() => setActiveSessionTab('ASHAR')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeSessionTab === 'ASHAR' ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
              >
                ☀️ ASHAR
              </button>
              <button
                type="button"
                onClick={() => setActiveSessionTab('MAGHRIB')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeSessionTab === 'MAGHRIB' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
              >
                🌙 MAGHRIB
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Sesi Waktu</th>
                  <th className="p-3">Halaqah</th>
                  <th className="p-3">Kitab / Materi</th>
                  <th className="p-3">Ustadz Pengampu</th>
                  <th className="p-3">Lokasi</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredRecords.map((item, idx) => {
                  const statusColors: Record<string, string> = {
                    PRESENT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
                    PERMISSION: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
                    SICK: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
                    OFFICIAL_DUTY: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300',
                  };
                  const statusLabels: Record<string, string> = {
                    PRESENT: 'Hadir',
                    PERMISSION: 'Izin',
                    SICK: 'Sakit',
                    OFFICIAL_DUTY: 'Tugas',
                  };

                  return (
                    <tr key={item.scheduleId || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-semibold whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${item.session === 'PAGI' ? 'bg-amber-50 text-amber-800 border-amber-300' : item.session === 'ASHAR' ? 'bg-orange-50 text-orange-800 border-orange-300' : 'bg-indigo-50 text-indigo-800 border-indigo-300'}`}>
                          {item.session}
                        </span>
                        <div className="text-[10px] text-slate-400">{item.timeSlot}</div>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {item.halaqah?.name}
                      </td>
                      <td className="p-3 text-emerald-700 dark:text-emerald-300 font-medium">
                        {item.kitab}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.teacher?.fullName}
                        </div>
                        {item.badalTeacherName && (
                          <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                            Badal: {item.badalTeacherName}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        {item.halaqah?.location || 'Masjid'}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {item.status ? (
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${statusColors[item.status] || 'bg-slate-100'}`}>
                            {statusLabels[item.status] || item.status}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                            Belum Absen
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <Link
                          href={`/pengajian/attendance?session=${item.session}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all"
                        >
                          Catat / Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Footer */}
        <Footer />

      </div>
    </div>
  );
}
