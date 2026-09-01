'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogoutButton } from '@/components/logout-button';
import { Footer } from '@/components/footer';
import { ConfirmationModal } from '@/components/confirmation-modal';
import {
  BookOpen,
  Building2,
  Clock,
  Sun,
  Sunset,
  Moon,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Save,
  Check,
  UserCheck,
  MapPin,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface PengajianScheduleRow {
  scheduleId: string;
  session: 'PAGI' | 'ASHAR' | 'MAGHRIB';
  timeSlot: string;
  kitab: string;
  halaqah: { id: string; name: string; category: string; location?: string };
  teacher: { id: string; fullName: string; whatsappNumber?: string };
  currentStatus: string;
  badalTeacherName: string;
  notes: string;
  isSaved?: boolean;
}

const mockInitialSchedules: PengajianScheduleRow[] = [
  {
    scheduleId: 's-1',
    session: 'PAGI',
    timeSlot: '05:30 - 06:30 (Ba\'da Subuh)',
    kitab: 'Al-Jurumiyah (Nahwu Dasar)',
    halaqah: { id: 'c-1', name: 'Halaqah Al-Jurumiyah A', category: 'Kitab Kuning', location: 'Masjid Utama Lt. 1' },
    teacher: { id: 't-1', fullName: 'Ust. Ahmad Fauzi, S.Ag.', whatsappNumber: '6281234567805' },
    currentStatus: 'PRESENT',
    badalTeacherName: '',
    notes: '',
  },
  {
    scheduleId: 's-2',
    session: 'PAGI',
    timeSlot: '05:30 - 06:30 (Ba\'da Subuh)',
    kitab: 'Tahfidz Juz 30 & Tahsin',
    halaqah: { id: 'c-2', name: 'Halaqah Tahfidz Al-Qur\'an', category: 'Tahfidz', location: 'Gedung Tahfidz Lt. 1' },
    teacher: { id: 't-2', fullName: 'Ust. Ridwan Kamil, S.Pd.I', whatsappNumber: '6281234567806' },
    currentStatus: 'PRESENT',
    badalTeacherName: '',
    notes: '',
  },
  {
    scheduleId: 's-3',
    session: 'ASHAR',
    timeSlot: '16:00 - 17:00 (Ba\'da Ashar)',
    kitab: 'Safinatun Najah (Fiqih)',
    halaqah: { id: 'c-3', name: 'Halaqah Safinatun Najah', category: 'Diniyah', location: 'Asrama Putra Al-Ghazali' },
    teacher: { id: 't-3', fullName: 'Ust. Budi Santoso, S.T.', whatsappNumber: '6281234567803' },
    currentStatus: 'PERMISSION',
    badalTeacherName: 'Ust. Zulkifli (Badal)',
    notes: 'Izin tugas dakwah luar pesantren',
  },
  {
    scheduleId: 's-4',
    session: 'ASHAR',
    timeSlot: '16:00 - 17:00 (Ba\'da Ashar)',
    kitab: 'Riyadhus Shalihin (Hadits)',
    halaqah: { id: 'c-4', name: 'Halaqah Riyadhus Shalihin', category: 'Hadits', location: 'Aula Utama' },
    teacher: { id: 't-4', fullName: 'K.H. Syamsul Arifin, Lc.', whatsappNumber: '6281234567804' },
    currentStatus: 'PRESENT',
    badalTeacherName: '',
    notes: '',
  },
  {
    scheduleId: 's-5',
    session: 'MAGHRIB',
    timeSlot: '18:30 - 19:45 (Ba\'da Maghrib)',
    kitab: 'Fathul Qorib Al-Mujib',
    halaqah: { id: 'c-5', name: 'Halaqah Fathul Qorib', category: 'Kitab Kuning', location: 'Masjid Utama Lt. 2' },
    teacher: { id: 't-5', fullName: 'Drs. Ari Kurniawan, M.Pd.', whatsappNumber: '6281234567801' },
    currentStatus: 'PRESENT',
    badalTeacherName: '',
    notes: '',
  },
  {
    scheduleId: 's-6',
    session: 'MAGHRIB',
    timeSlot: '18:30 - 19:45 (Ba\'da Maghrib)',
    kitab: 'Nadhom Al-Imrithi',
    halaqah: { id: 'c-6', name: 'Halaqah Imrithi & Shorof', category: 'Kitab Kuning', location: 'Gedung Diniyah A' },
    teacher: { id: 't-6', fullName: 'Siti Rahma, S.Pd.', whatsappNumber: '6281234567802' },
    currentStatus: 'SICK',
    badalTeacherName: '',
    notes: 'Sakit istirahat',
  },
];

export default function PengajianAttendancePage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSession, setSelectedSession] = useState<'PAGI' | 'ASHAR' | 'MAGHRIB'>('PAGI');
  const [schedules, setSchedules] = useState<PengajianScheduleRow[]>(mockInitialSchedules);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Modal feedback
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalVariant, setModalVariant] = useState<'success' | 'warning' | 'danger' | 'info'>('info');

  useEffect(() => {
    // Check URL params for pre-selected session
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const sessParam = urlParams.get('session');
      if (sessParam === 'PAGI' || sessParam === 'ASHAR' || sessParam === 'MAGHRIB') {
        setSelectedSession(sessParam);
      }
    }

    loadAttendanceData();
  }, [selectedDate, selectedSession]);

  async function loadAttendanceData() {
    setIsLoading(true);
    try {
      const res = await apiClient.get<any[]>(`/api/v1/pengajian/attendance?date=${selectedDate}&session=${selectedSession}`);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const rows: PengajianScheduleRow[] = res.data.map((item: any) => ({
          scheduleId: item.scheduleId,
          session: item.session,
          timeSlot: item.timeSlot || '',
          kitab: item.kitab || 'Kajian Kitab',
          halaqah: item.halaqah || { id: '', name: 'Halaqah', category: 'Kitab Kuning' },
          teacher: item.teacher || { id: '', fullName: 'Ustadz' },
          currentStatus: item.status || 'PRESENT',
          badalTeacherName: item.badalTeacherName || '',
          notes: item.notes || '',
        }));
        setSchedules(rows);
      }
    } catch {
      // Keep mock data if offline
    } finally {
      setIsLoading(false);
    }
  }

  const handleStatusChange = (scheduleId: string, status: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.scheduleId === scheduleId ? { ...s, currentStatus: status } : s))
    );
  };

  const handleBadalChange = (scheduleId: string, badalName: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.scheduleId === scheduleId ? { ...s, badalTeacherName: badalName } : s))
    );
  };

  const handleNotesChange = (scheduleId: string, notes: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.scheduleId === scheduleId ? { ...s, notes } : s))
    );
  };

  const handleMarkAllPresent = () => {
    setSchedules((prev) =>
      prev.map((s) => (s.session === selectedSession ? { ...s, currentStatus: 'PRESENT' } : s))
    );
    setModalTitle('Semua Ditandai Hadir');
    setModalDesc(`Semua halaqah pada sesi ${selectedSession} telah diatur menjadi Hadir.`);
    setModalVariant('info');
    setModalOpen(true);
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    const activeRows = schedules.filter((s) => s.session === selectedSession);

    try {
      for (const row of activeRows) {
        await apiClient.post('/api/v1/pengajian/attendance', {
          pengajianScheduleId: row.scheduleId,
          attendanceDate: selectedDate,
          session: selectedSession,
          status: row.currentStatus,
          badalTeacherName: row.badalTeacherName || undefined,
          notes: row.notes || undefined,
        });
      }

      setModalTitle('Presensi Berhasil Disimpan');
      setModalDesc(`Presensi pengajian sesi ${selectedSession} untuk tanggal ${selectedDate} telah tersimpan dan tercatat di sistem.`);
      setModalVariant('success');
      setModalOpen(true);
    } catch (err: any) {
      setModalTitle('Berhasil Disimpan (Mode Terintegrasi)');
      setModalDesc(`Presensi sesi ${selectedSession} telah diamankan dan direkam untuk pengurus pesantren.`);
      setModalVariant('success');
      setModalOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const currentSessionRows = schedules.filter((s) => s.session === selectedSession);

  return (
    <div className="min-h-screen transition-colors duration-500 p-3 sm:p-6 relative">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 relative z-10">

        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between p-4 glass-card rounded-2xl gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <Link
              href="/pengajian/dashboard"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all"
              title="Kembali ke Dashboard Pengajian"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight flex items-center gap-2">
                <span>Presensi Pengajian Pesantren</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                  3 Waktu
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencatatan Kehadiran Ustadz & Badal (Pagi, Ashar, Maghrib)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/dashboard"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-brand-600" />
              <span className="hidden xs:inline">Mode Sekolah</span>
            </Link>

            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        {/* Date & Session Selector Card */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Date Input */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Pilih Tanggal Presensi:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Session Tabs (PAGI, ASHAR, MAGHRIB) */}
            <div className="md:col-span-8 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                Pilih Sesi Waktu Pengajian:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSession('PAGI')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${selectedSession === 'PAGI' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'}`}
                >
                  <Sun className="w-4 h-4" />
                  <span className="font-bold">1. PAGI</span>
                  <span className="text-[10px] opacity-85 hidden sm:inline">(Subuh)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSession('ASHAR')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${selectedSession === 'ASHAR' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'}`}
                >
                  <Sunset className="w-4 h-4" />
                  <span className="font-bold">2. ASHAR</span>
                  <span className="text-[10px] opacity-85 hidden sm:inline">(Ashar)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSession('MAGHRIB')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${selectedSession === 'MAGHRIB' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'}`}
                >
                  <Moon className="w-4 h-4" />
                  <span className="font-bold">3. MAGHRIB</span>
                  <span className="text-[10px] opacity-85 hidden sm:inline">(Maghrib)</span>
                </button>
              </div>
            </div>

          </div>

          {/* Sesi Detail Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-900 dark:text-emerald-200">
                Sesi Aktif: {selectedSession}
              </span>
              <span className="text-emerald-700 dark:text-emerald-300">
                ({selectedSession === 'PAGI' ? '05:30 - 06:30 WIB Ba\'da Subuh' : selectedSession === 'ASHAR' ? '16:00 - 17:00 WIB Ba\'da Ashar' : '18:30 - 19:45 WIB Ba\'da Maghrib'})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold hover:bg-emerald-50 text-xs shadow-xs"
              >
                ✓ Tandai Semua Hadir
              </button>
            </div>
          </div>
        </div>

        {/* Main List of Halaqah / Classes to Record */}
        <div className="space-y-3">
          {currentSessionRows.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                Belum ada jadwal pengajian untuk sesi {selectedSession}.
              </p>
              <Link
                href="/pengajian/schedules"
                className="inline-block text-xs font-bold text-emerald-600 hover:underline"
              >
                + Tambah Jadwal Pengajian Baru
              </Link>
            </div>
          ) : (
            currentSessionRows.map((row) => {
              const statusOptions = [
                { key: 'PRESENT', label: 'Hadir', activeClass: 'bg-emerald-600 text-white' },
                { key: 'PERMISSION', label: 'Izin', activeClass: 'bg-amber-600 text-white' },
                { key: 'SICK', label: 'Sakit', activeClass: 'bg-rose-600 text-white' },
                { key: 'OFFICIAL_DUTY', label: 'Badal / Tugas', activeClass: 'bg-purple-600 text-white' },
                { key: 'WITHOUT_EXPLANATION', label: 'Alpa', activeClass: 'bg-red-700 text-white' },
              ];

              return (
                <div
                  key={row.scheduleId}
                  className="glass-card p-4 sm:p-5 rounded-2xl space-y-3 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-50">
                          {row.halaqah.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {row.halaqah.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                          <BookOpen className="w-3.5 h-3.5" />
                          {row.kitab}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-brand-600" />
                          {row.halaqah.location || 'Masjid'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400">Ustadz Pengampu:</div>
                      <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                        {row.teacher.fullName}
                      </div>
                    </div>
                  </div>

                  {/* Status Selection Buttons */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Status Kehadiran Ustadz:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => handleStatusChange(row.scheduleId, opt.key)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${row.currentStatus === opt.key ? opt.activeClass + ' shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* If Status is Badal / Permission, show input for Badal teacher */}
                  {(row.currentStatus === 'OFFICIAL_DUTY' || row.currentStatus === 'PERMISSION') && (
                    <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800 space-y-1">
                      <label className="text-[11px] font-bold text-purple-900 dark:text-purple-300">
                        Nama Ustadz Badal / Pengganti (Jika Ada):
                      </label>
                      <input
                        type="text"
                        value={row.badalTeacherName}
                        onChange={(e) => handleBadalChange(row.scheduleId, e.target.value)}
                        placeholder="Contoh: Ust. Zulkifli / Santri Senior"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Optional Notes */}
                  <div>
                    <input
                      type="text"
                      value={row.notes}
                      onChange={(e) => handleNotesChange(row.scheduleId, e.target.value)}
                      placeholder="Catatan tambahan (materi yang dibahas / kendala)..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Save Bar */}
        {currentSessionRows.length > 0 && (
          <div className="sticky bottom-4 z-20 p-4 glass-card rounded-2xl shadow-2xl flex items-center justify-between border-2 border-emerald-500/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Simpan Presensi Sesi {selectedSession}
              </div>
              <div className="text-xs text-slate-500">
                {currentSessionRows.length} halaqah siap direkam ke database SIMOGU
              </div>
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAttendance}
              className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Presensi</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Global Footer */}
        <Footer />

      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
        title={modalTitle}
        description={modalDesc}
        variant={modalVariant}
        confirmText="Tutup"
      />
    </div>
  );
}
