'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogoutButton } from '@/components/logout-button';
import { Footer } from '@/components/footer';
import { ConfirmationModal } from '@/components/confirmation-modal';
import {
  Calendar,
  ArrowLeft,
  Plus,
  BookOpen,
  Sun,
  Sunset,
  Moon,
  Trash2,
  Building2,
  Clock,
  Layers,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface ScheduleItem {
  id: string;
  pengajianClassId: string;
  teacherId: string;
  session: 'PAGI' | 'ASHAR' | 'MAGHRIB';
  dayOfWeek: string;
  kitab: string;
  timeSlot?: string | null;
  pengajianClass?: { id: string; name: string; category: string; location?: string };
  teacher?: { id: string; fullName: string };
}

const initialSchedules: ScheduleItem[] = [
  { id: 'sc-1', pengajianClassId: 'c-1', teacherId: 't-1', session: 'PAGI', dayOfWeek: 'MONDAY', kitab: 'Al-Jurumiyah A', timeSlot: '05:30 - 06:30', pengajianClass: { id: 'c-1', name: 'Halaqah Al-Jurumiyah A', category: 'Kitab Kuning' }, teacher: { id: 't-1', fullName: 'Ust. Ahmad Fauzi, S.Ag.' } },
  { id: 'sc-2', pengajianClassId: 'c-2', teacherId: 't-2', session: 'PAGI', dayOfWeek: 'MONDAY', kitab: 'Tahfidz Juz 30', timeSlot: '05:30 - 06:30', pengajianClass: { id: 'c-2', name: 'Halaqah Tahfidz Al-Qur\'an', category: 'Tahfidz' }, teacher: { id: 't-2', fullName: 'Ust. Ridwan Kamil, S.Pd.I' } },
  { id: 'sc-3', pengajianClassId: 'c-3', teacherId: 't-3', session: 'ASHAR', dayOfWeek: 'MONDAY', kitab: 'Safinatun Najah', timeSlot: '16:00 - 17:00', pengajianClass: { id: 'c-3', name: 'Halaqah Safinatun Najah', category: 'Diniyah' }, teacher: { id: 't-3', fullName: 'Ust. Budi Santoso, S.T.' } },
  { id: 'sc-4', pengajianClassId: 'c-4', teacherId: 't-4', session: 'ASHAR', dayOfWeek: 'MONDAY', kitab: 'Riyadhus Shalihin', timeSlot: '16:00 - 17:00', pengajianClass: { id: 'c-4', name: 'Halaqah Riyadhus Shalihin', category: 'Hadits' }, teacher: { id: 't-4', fullName: 'K.H. Syamsul Arifin, Lc.' } },
  { id: 'sc-5', pengajianClassId: 'c-5', teacherId: 't-5', session: 'MAGHRIB', dayOfWeek: 'MONDAY', kitab: 'Fathul Qorib', timeSlot: '18:30 - 19:45', pengajianClass: { id: 'c-5', name: 'Halaqah Fathul Qorib', category: 'Kitab Kuning' }, teacher: { id: 't-5', fullName: 'Drs. Ari Kurniawan, M.Pd.' } },
];

export default function PengajianSchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [selectedDay, setSelectedDay] = useState<string>('MONDAY');
  const [selectedSession, setSelectedSession] = useState<'ALL' | 'PAGI' | 'ASHAR' | 'MAGHRIB'>('ALL');

  // Modal create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    pengajianClassId: '',
    teacherId: '',
    session: 'PAGI' as 'PAGI' | 'ASHAR' | 'MAGHRIB',
    dayOfWeek: 'MONDAY',
    kitab: '',
    timeSlot: '05:30 - 06:30',
  });

  // Alert
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDesc, setAlertDesc] = useState('');

  useEffect(() => {
    loadSchedules();
    loadClassesAndTeachers();
  }, [selectedDay]);

  async function loadSchedules() {
    try {
      const res = await apiClient.get<ScheduleItem[]>(`/api/v1/pengajian/schedules?dayOfWeek=${selectedDay}`);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setSchedules(res.data);
      }
    } catch {
      // fallback
    }
  }

  async function loadClassesAndTeachers() {
    try {
      const [cRes, tRes] = await Promise.all([
        apiClient.get<any[]>('/api/v1/pengajian/classes'),
        apiClient.get<any[]>('/api/v1/teachers'),
      ]);
      if (cRes.success && cRes.data) setClassesList(cRes.data);
      if (tRes.success && tRes.data) setTeachersList(tRes.data);
    } catch {
      // fallback
    }
  }

  const handleOpenAdd = () => {
    setFormData({
      pengajianClassId: classesList[0]?.id || 'c-1',
      teacherId: teachersList[0]?.id || 't-1',
      session: 'PAGI',
      dayOfWeek: selectedDay,
      kitab: '',
      timeSlot: '05:30 - 06:30',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kitab.trim()) return;

    try {
      const res = await apiClient.post<ScheduleItem>('/api/v1/pengajian/schedules', formData);
      if (res.success && res.data) {
        setSchedules((prev) => [...prev, res.data!]);
      }
    } catch {
      const chosenClass = classesList.find((c) => c.id === formData.pengajianClassId);
      const chosenTeacher = teachersList.find((t) => t.id === formData.teacherId);
      const mockNew: ScheduleItem = {
        id: `sc-${Date.now()}`,
        pengajianClassId: formData.pengajianClassId,
        teacherId: formData.teacherId,
        session: formData.session,
        dayOfWeek: formData.dayOfWeek,
        kitab: formData.kitab,
        timeSlot: formData.timeSlot,
        pengajianClass: chosenClass || { id: 'c-1', name: 'Halaqah Baru', category: 'Kitab Kuning' },
        teacher: chosenTeacher || { id: 't-1', fullName: 'Ustadz Pengampu' },
      };
      setSchedules((prev) => [...prev, mockNew]);
    }

    setAlertTitle('Jadwal Ditambahkan');
    setAlertDesc(`Jadwal pengajian sesi ${formData.session} hari ${formData.dayOfWeek} berhasil dibuat.`);
    setAlertOpen(true);
    setIsModalOpen(false);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      try {
        await apiClient.delete(`/api/v1/pengajian/schedules/${id}`);
      } catch {
        // ignore
      }
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      setAlertTitle('Jadwal Dihapus');
      setAlertDesc('Jadwal pengajian telah berhasil dihapus.');
      setAlertOpen(true);
    }
  };

  const daysOfWeek = [
    { key: 'MONDAY', label: 'Senin' },
    { key: 'TUESDAY', label: 'Selasa' },
    { key: 'WEDNESDAY', label: 'Rabu' },
    { key: 'THURSDAY', label: 'Kamis' },
    { key: 'FRIDAY', label: 'Jumat' },
    { key: 'SATURDAY', label: 'Sabtu' },
    { key: 'SUNDAY', label: 'Ahad' },
  ];

  const filtered = schedules.filter((s) => {
    const matchDay = s.dayOfWeek === selectedDay;
    const matchSession = selectedSession === 'ALL' || s.session === selectedSession;
    return matchDay && matchSession;
  });

  return (
    <div className="min-h-screen transition-colors duration-500 p-3 sm:p-6 relative">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 relative z-10">

        {/* Header */}
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
                <span>Pengaturan Jadwal Pengajian</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Alokasi waktu kitab & ustadz untuk sesi PAGI, ASHAR, dan MAGHRIB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jadwal</span>
            </button>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        {/* Day of Week Navigation Tabs */}
        <div className="glass-card p-3 rounded-2xl shadow-sm overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {daysOfWeek.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setSelectedDay(d.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedDay === d.key ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Session Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 glass-card rounded-xl">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Filter Sesi Hari {daysOfWeek.find((d) => d.key === selectedDay)?.label}:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedSession('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedSession === 'ALL' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              Semua Sesi
            </button>
            <button
              type="button"
              onClick={() => setSelectedSession('PAGI')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${selectedSession === 'PAGI' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>PAGI</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedSession('ASHAR')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${selectedSession === 'ASHAR' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              <Sunset className="w-3.5 h-3.5" />
              <span>ASHAR</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedSession('MAGHRIB')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${selectedSession === 'MAGHRIB' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>MAGHRIB</span>
            </button>
          </div>
        </div>

        {/* Schedules Table */}
        <div className="glass-card p-4 rounded-2xl shadow-md overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Sesi</th>
                <th className="p-3">Rentang Jam</th>
                <th className="p-3">Halaqah</th>
                <th className="p-3">Kitab / Materi</th>
                <th className="p-3">Ustadz Pengampu</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                    Tidak ada jadwal pengajian yang ditemukan untuk pilihan ini.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] border ${item.session === 'PAGI' ? 'bg-amber-100 text-amber-900 border-amber-300' : item.session === 'ASHAR' ? 'bg-orange-100 text-orange-900 border-orange-300' : 'bg-indigo-100 text-indigo-900 border-indigo-300'}`}>
                        {item.session}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {item.timeSlot || '-'}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {item.pengajianClass?.name}
                    </td>
                    <td className="p-3 font-semibold text-emerald-700 dark:text-emerald-400">
                      {item.kitab}
                    </td>
                    <td className="p-3 text-slate-800 dark:text-slate-200 font-medium">
                      {item.teacher?.fullName}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteSchedule(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <Footer />

      </div>

      {/* Add Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Tambah Jadwal Pengajian
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pilih Halaqah:
                </label>
                <select
                  value={formData.pengajianClassId}
                  onChange={(e) => setFormData({ ...formData, pengajianClassId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pilih Ustadz Pengampu:
                </label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {teachersList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.subject || 'Umum'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Sesi Waktu:
                  </label>
                  <select
                    value={formData.session}
                    onChange={(e) => {
                      const sess = e.target.value as 'PAGI' | 'ASHAR' | 'MAGHRIB';
                      setFormData({
                        ...formData,
                        session: sess,
                        timeSlot: sess === 'PAGI' ? '05:30 - 06:30' : sess === 'ASHAR' ? '16:00 - 17:00' : '18:30 - 19:45',
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="PAGI">1. PAGI (Ba&apos;da Subuh)</option>
                    <option value="ASHAR">2. ASHAR (Ba&apos;da Ashar)</option>
                    <option value="MAGHRIB">3. MAGHRIB (Ba&apos;da Maghrib)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Hari:
                  </label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {daysOfWeek.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kitab / Materi Kajian:
                </label>
                <input
                  type="text"
                  required
                  value={formData.kitab}
                  onChange={(e) => setFormData({ ...formData, kitab: e.target.value })}
                  placeholder="Contoh: Kitab Fathul Qorib Bab Sholat"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Rentang Jam:
                </label>
                <input
                  type="text"
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  placeholder="05:30 - 06:30"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert */}
      <ConfirmationModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        onConfirm={() => setAlertOpen(false)}
        title={alertTitle}
        description={alertDesc}
        variant="success"
        confirmText="Tutup"
      />
    </div>
  );
}
