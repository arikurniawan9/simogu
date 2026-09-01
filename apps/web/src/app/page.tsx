'use client';

import React, { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { DataTable, Column } from '@/components/data-table';
import { Footer } from '@/components/footer';
import { Shield, LogIn, LayoutDashboard, Search, ArrowRight, BookOpen, Clock, Sparkles, Sun, Sunset, Moon, MapPin, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface PublicTeacherAttendance {
  id: string;
  code: string;
  name: string;
  subject: string;
  status: string;
  timeSlot: string;
}

interface PublicPengajianAttendance {
  id: string;
  session: 'PAGI' | 'ASHAR' | 'MAGHRIB';
  timeSlot: string;
  halaqah: string;
  category: string;
  kitab: string;
  ustadz: string;
  badal?: string | null;
  location: string;
  status: string;
}

const initialFormalTeachers: PublicTeacherAttendance[] = [
  { id: '1', code: 'GRU-001', name: 'Drs. Ari Kurniawan, M.Pd.', subject: 'Matematika', status: 'Hadir', timeSlot: '07:00 - 08:30 (Jam 1-2)' },
  { id: '2', code: 'GRU-002', name: 'Siti Rahma, S.Pd.', subject: 'Bahasa Indonesia', status: 'Izin', timeSlot: '08:30 - 10:00 (Jam 3-4)' },
  { id: '3', code: 'GRU-003', name: 'Budi Santoso, S.T.', subject: 'Fisika', status: 'Sakit', timeSlot: '07:00 - 08:30 (Jam 1-2)' },
  { id: '4', code: 'GRU-004', name: 'Dewi Lestari, M.Sc.', subject: 'Biologi', status: 'Hadir', timeSlot: '10:15 - 11:45 (Jam 5-6)' },
  { id: '5', code: 'GRU-005', name: 'Ahmad Fauzi, S.Ag.', subject: 'Pendidikan Agama', status: 'Tugas Dinas', timeSlot: '08:30 - 10:00 (Jam 3-4)' },
  { id: '6', code: 'GRU-006', name: 'Rina Wijaya, S.Kom.', subject: 'Informatika', status: 'Hadir', timeSlot: '10:15 - 11:45 (Jam 5-6)' },
];

const initialPengajianList: PublicPengajianAttendance[] = [
  { id: 'p-1', session: 'PAGI', timeSlot: '05:30 - 06:30 (Ba\'da Subuh)', halaqah: 'Halaqah Al-Jurumiyah A', category: 'Kitab Kuning', kitab: 'Al-Jurumiyah (Nahwu Dasar)', ustadz: 'Ust. Ahmad Fauzi, S.Ag.', location: 'Masjid Utama Lt. 1', status: 'Hadir' },
  { id: 'p-2', session: 'PAGI', timeSlot: '05:30 - 06:30 (Ba\'da Subuh)', halaqah: 'Halaqah Tahfidz Putra', category: 'Tahfidz', kitab: 'Tahfidz Juz 30 & Tahsin', ustadz: 'Ust. Ridwan Kamil, S.Pd.I', location: 'Gedung Tahfidz Lt. 1', status: 'Hadir' },
  { id: 'p-3', session: 'ASHAR', timeSlot: '16:00 - 17:00 (Ba\'da Ashar)', halaqah: 'Halaqah Safinatun Najah', category: 'Diniyah', kitab: 'Safinatun Najah (Fiqih Dasar)', ustadz: 'Ust. Budi Santoso, S.T.', badal: 'Ust. Zulkifli (Badal)', location: 'Asrama Putra Al-Ghazali', status: 'Izin' },
  { id: 'p-4', session: 'ASHAR', timeSlot: '16:00 - 17:00 (Ba\'da Ashar)', halaqah: 'Halaqah Riyadhus Shalihin', category: 'Hadits', kitab: 'Riyadhus Shalihin (Hadits)', ustadz: 'K.H. Syamsul Arifin, Lc.', location: 'Aula Utama Pesantren', status: 'Hadir' },
  { id: 'p-5', session: 'MAGHRIB', timeSlot: '18:30 - 19:45 (Ba\'da Maghrib)', halaqah: 'Halaqah Fathul Qorib', category: 'Kitab Kuning', kitab: 'Fathul Qorib Al-Mujib', ustadz: 'Drs. Ari Kurniawan, M.Pd.', location: 'Masjid Utama Lt. 2', status: 'Hadir' },
  { id: 'p-6', session: 'MAGHRIB', timeSlot: '18:30 - 19:45 (Ba\'da Maghrib)', halaqah: 'Halaqah Imrithi & Shorof', category: 'Kitab Kuning', kitab: 'Nadhom Al-Imrithi', ustadz: 'Siti Rahma, S.Pd.', location: 'Gedung Diniyah A', status: 'Hadir' },
];

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState('/login');
  const [userRole, setUserRole] = useState<string>('');

  // Mode Selection: Formal School vs Pesantren Pengajian
  const [activeTab, setActiveTab] = useState<'sekolah' | 'pengajian'>('sekolah');
  const [sessionFilter, setSessionFilter] = useState<'ALL' | 'PAGI' | 'ASHAR' | 'MAGHRIB'>('ALL');

  const [formalTeachers, setFormalTeachers] = useState<PublicTeacherAttendance[]>(initialFormalTeachers);
  const [pengajianList, setPengajianList] = useState<PublicPengajianAttendance[]>(initialPengajianList);

  // Determine current active time session in WIB
  const [currentActiveSession, setCurrentActiveSession] = useState<'PAGI' | 'ASHAR' | 'MAGHRIB' | 'ISTIRAHAT'>('PAGI');

  useEffect(() => {
    // Determine session by hour (WIB)
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) {
      setCurrentActiveSession('PAGI');
    } else if (hour >= 15 && hour < 18) {
      setCurrentActiveSession('ASHAR');
    } else if (hour >= 18 && hour < 21) {
      setCurrentActiveSession('MAGHRIB');
    } else {
      setCurrentActiveSession('ISTIRAHAT');
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('simogu_token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('simogu_user') : null;

    if (token) {
      setIsLoggedIn(true);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const role = (user.role || '').toUpperCase();
          setUserRole(role);
          if (role === 'SUPER_ADMIN' || role.includes('SUPER')) {
            setDashboardUrl('/superadmin/dashboard');
          } else if (role === 'KETUA_PIKET_PENGAJIAN' || role.includes('KETUA_PENG')) {
            setDashboardUrl('/pengajian/dashboard');
          } else if (role === 'PIKET_PENGAJIAN' || role.includes('PIKET_PENG')) {
            setDashboardUrl('/pengajian/attendance');
          } else if (role === 'KETUA_PIKET' || role.includes('KETUA')) {
            setDashboardUrl('/ketua-piket/dashboard');
          } else if (role === 'PIKET') {
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

    // Load formal school teachers
    async function loadPublicFormal() {
      const res = await apiClient.get<any[]>('/api/v1/teachers/search?q=');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: PublicTeacherAttendance[] = res.data.map((t: any, idx: number) => ({
          id: t.id,
          code: t.teacherCode,
          name: t.fullName,
          subject: t.subject || 'Umum',
          status: 'Hadir',
          timeSlot: `07:00 - 08:30 (Jam ${(idx % 3) * 2 + 1}-${(idx % 3) * 2 + 2})`,
        }));
        setFormalTeachers(mapped);
      }
    }

    // Load public pengajian summary
    async function loadPublicPengajian() {
      const res = await apiClient.get<any>('/api/v1/pengajian/attendance/today-summary');
      if (res.success && res.data?.records && Array.isArray(res.data.records) && res.data.records.length > 0) {
        const mapped: PublicPengajianAttendance[] = res.data.records.map((r: any, idx: number) => ({
          id: r.scheduleId || `p-${idx}`,
          session: r.session || 'PAGI',
          timeSlot: r.timeSlot || 'Sesuai Jadwal',
          halaqah: r.halaqah?.name || 'Halaqah Pengajian',
          category: r.halaqah?.category || 'Kitab Kuning',
          kitab: r.kitab || 'Kajian Kitab',
          ustadz: r.teacher?.fullName || 'Ustadz Pengampu',
          badal: r.badalTeacherName || null,
          location: r.halaqah?.location || 'Masjid Utama',
          status: r.status ? (r.status === 'PRESENT' ? 'Hadir' : r.status === 'SICK' ? 'Sakit' : r.status === 'PERMISSION' ? 'Izin' : r.status === 'OFFICIAL_DUTY' ? 'Tugas' : 'Belum Absen') : 'Hadir',
        }));
        setPengajianList(mapped);
      }
    }

    loadPublicFormal();
    loadPublicPengajian();
  }, []);

  const formalColumns: Column<PublicTeacherAttendance>[] = [
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

  // Filtered Pengajian List
  const filteredPengajian = sessionFilter === 'ALL'
    ? pengajianList
    : pengajianList.filter((p) => p.session === sessionFilter);

  const pengajianColumns: Column<PublicPengajianAttendance>[] = [
    {
      key: 'session',
      header: 'Sesi Waktu',
      render: (item) => {
        const sessionMeta: Record<string, { label: string; color: string; icon: any }> = {
          PAGI: { label: '🌅 PAGI', color: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300', icon: Sun },
          ASHAR: { label: '☀️ ASHAR', color: 'bg-orange-100 text-orange-900 dark:bg-orange-950/80 dark:text-orange-300 border-orange-300', icon: Sunset },
          MAGHRIB: { label: '🌙 MAGHRIB', color: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300', icon: Moon },
        };
        const meta = sessionMeta[item.session] || sessionMeta.PAGI;
        return (
          <div className="flex flex-col">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold border ${meta.color}`}>
              {meta.label}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {item.timeSlot}
            </span>
          </div>
        );
      },
    },
    {
      key: 'halaqah',
      header: 'Halaqah & Kitab',
      render: (item) => (
        <div>
          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
            {item.halaqah}
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <BookOpen className="w-3 h-3 shrink-0" />
            <span>{item.kitab}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'ustadz',
      header: 'Ustadz / Pengajar',
      render: (item) => (
        <div>
          <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
            {item.ustadz}
          </div>
          {item.badal && (
            <span className="inline-block mt-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800">
              Badal: {item.badal}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Lokasi Halaqah',
      render: (item) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-brand-600" />
          {item.location}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status Kehadiran',
      render: (item) => {
        const badgeColors: Record<string, string> = {
          Hadir: 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          Izin: 'bg-amber-50/90 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          Sakit: 'bg-rose-50/90 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          Tugas: 'bg-sky-50/90 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200 dark:border-sky-800',
          'Belum Absen': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${badgeColors[item.status] || badgeColors.Hadir}`}>
            {item.status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 p-3 sm:p-6 relative">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 relative z-10">

        {/* Top Header Bar */}
        <header className="flex items-center justify-between p-3.5 sm:p-4 glass-card rounded-2xl">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/25 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight flex items-center gap-1.5">
                <span>SIMOGU</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                  Pesantren Boarding
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                Monitoring Presensi Guru Sekolah & Ustadz Pengajian
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
                <span className="hidden sm:inline">Dashboard ({userRole.replace('_', ' ') || 'Petugas'})</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 active:scale-95 text-white shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Petugas</span>
              </Link>
            )}

            <ThemeToggle />
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-emerald-800 to-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-emerald-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sistem Monitoring Terpadu Pesantren & Boarding School</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight">
              Presensi Kehadiran Guru Sekolah & Pengajian Pesantren
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
              Portal keterbukaan data jam mengajar sekolah formal serta 3 sesi pengajian kitab pesantren (PAGI Ba&apos;da Subuh, ASHAR, dan MAGHRIB) yang terintegrasi secara real-time.
            </p>

            {/* Current Active Session Status Pill */}
            <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/15 text-xs text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300">Waktu Operasional Sekarang:</span>
              <span className="font-bold text-amber-300">
                {currentActiveSession === 'PAGI' && '🌅 Sesi Pengajian PAGI (Ba\'da Subuh)'}
                {currentActiveSession === 'ASHAR' && '☀️ Sesi Pengajian ASHAR (Ba\'da Ashar)'}
                {currentActiveSession === 'MAGHRIB' && '🌙 Sesi Pengajian MAGHRIB (Ba\'da Maghrib)'}
                {currentActiveSession === 'ISTIRAHAT' && '🏫 Jam Sekolah Formal Aktif'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('pengajian')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all flex items-center gap-2 ${activeTab === 'pengajian' ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-300' : 'bg-white/20 hover:bg-white/30 text-white'}`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Lihat Absensi Pengajian (3 Sesi)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sekolah')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all flex items-center gap-2 ${activeTab === 'sekolah' ? 'bg-white text-slate-900 ring-2 ring-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
              >
                <Building2 className="w-4 h-4" />
                <span>Lihat Absensi Sekolah Formal</span>
              </button>

              {!isLoggedIn && (
                <Link
                  href="/login"
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900/80 hover:bg-slate-900 text-white border border-white/20 shadow-sm active:scale-95 transition-all flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Piket / Pengurus</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Main Attendance Module Section with Mode Switcher */}
        <div className="glass-card p-4 sm:p-6 rounded-2xl space-y-4 shadow-xl">
          
          {/* Top Switcher Navigation Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Pilih Moda Tampilan:
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('sekolah')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'sekolah' ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>1. Sekolah Formal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pengajian')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'pengajian' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>2. Pengajian Pesantren (Pagi, Ashar, Maghrib)</span>
                </button>
              </div>
            </div>

            {/* Quick Link to Direct Portal or Login */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {activeTab === 'pengajian' ? (
                <Link
                  href="/pengajian/attendance"
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  Buka Form Input Absensi Pengajian <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  href="/guru"
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  Pencarian Guru Formal <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* TAB 1: SEKOLAH FORMAL */}
          {activeTab === 'sekolah' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-600" />
                  Ringkasan Kehadiran Guru Sekolah Hari Ini
                </h3>
                <span className="text-xs text-slate-500">Jam Ke-1 s/d Jam Ke-10</span>
              </div>
              <DataTable
                data={formalTeachers}
                columns={formalColumns}
                searchPlaceholder="Cari kode atau nama guru di daftar publik..."
                pageSizeOptions={[5, 10]}
              />
            </div>
          )}

          {/* TAB 2: PENGAJIAN PESANTREN (PAGI, ASHAR, MAGHRIB) */}
          {activeTab === 'pengajian' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    Jadwal & Presensi Pengajian Kitab Pesantren Hari Ini
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Memantau kehadiran ustadz dan ustadz badal pada waktu PAGI, ASHAR, dan MAGHRIB
                  </p>
                </div>

                {/* Filter 3 Sesi Pengajian */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSessionFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${sessionFilter === 'ALL' ? 'bg-emerald-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
                  >
                    Semua ({pengajianList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionFilter('PAGI')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${sessionFilter === 'PAGI' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
                  >
                    <span>🌅 PAGI</span>
                    <span className="text-[10px] opacity-80">({pengajianList.filter((p) => p.session === 'PAGI').length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionFilter('ASHAR')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${sessionFilter === 'ASHAR' ? 'bg-orange-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
                  >
                    <span>☀️ ASHAR</span>
                    <span className="text-[10px] opacity-80">({pengajianList.filter((p) => p.session === 'ASHAR').length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionFilter('MAGHRIB')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${sessionFilter === 'MAGHRIB' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
                  >
                    <span>🌙 MAGHRIB</span>
                    <span className="text-[10px] opacity-80">({pengajianList.filter((p) => p.session === 'MAGHRIB').length})</span>
                  </button>
                </div>
              </div>

              <DataTable
                data={filteredPengajian}
                columns={pengajianColumns}
                searchPlaceholder="Cari nama ustadz, kitab, atau halaqah pengajian..."
                pageSizeOptions={[5, 10]}
              />
            </div>
          )}

        </div>

        {/* Global Footer */}
        <Footer />

      </div>
    </div>
  );
}
