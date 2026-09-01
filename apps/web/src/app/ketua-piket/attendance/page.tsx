'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogoutButton } from '@/components/logout-button';
import { Footer } from '@/components/footer';
import {
  ArrowLeft,
  ClipboardCheck,
  ShieldCheck,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit3,
  User,
  Filter,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface AttendanceItem {
  id: string;
  className: string;
  jenjang: 'SMP' | 'SMA' | 'SMK';
  teacherCode: string;
  teacherName: string;
  subject: string;
  periodNumber: number;
  periodTime: string;
  status: 'PRESENT' | 'PERMISSION' | 'DUTY' | 'SICK' | 'ABSENT' | 'NOT_RECORDED';
  notes?: string;
  lastUpdatedBy?: string;
}

const initialAttendanceData: AttendanceItem[] = [
  {
    id: 'att-1',
    className: 'X IPA 1',
    jenjang: 'SMA',
    teacherCode: 'GRU-001',
    teacherName: 'Drs. Ari Kurniawan, M.Pd.',
    subject: 'Matematika Peminatan',
    periodNumber: 1,
    periodTime: '07:00 - 07:45',
    status: 'PRESENT',
    notes: 'Hadir tepat waktu di kelas',
    lastUpdatedBy: 'Petugas Piket (Ahmad Fauzi)',
  },
  {
    id: 'att-2',
    className: 'X IPA 1',
    jenjang: 'SMA',
    teacherCode: 'GRU-001',
    teacherName: 'Drs. Ari Kurniawan, M.Pd.',
    subject: 'Matematika Peminatan',
    periodNumber: 2,
    periodTime: '07:45 - 08:30',
    status: 'PRESENT',
    notes: 'Hadir tepat waktu di kelas',
    lastUpdatedBy: 'Petugas Piket (Ahmad Fauzi)',
  },
  {
    id: 'att-3',
    className: 'X IPA 1',
    jenjang: 'SMA',
    teacherCode: 'GRU-002',
    teacherName: 'Siti Rahma, S.Pd.',
    subject: 'Bahasa Indonesia',
    periodNumber: 3,
    periodTime: '08:30 - 09:15',
    status: 'PERMISSION',
    notes: 'Izin MGMP tingkat Kabupaten - Disetujui Ketua Piket',
    lastUpdatedBy: 'Ketua Piket (Drs. H. Ahmad Dahlan)',
  },
  {
    id: 'att-4',
    className: 'X TKJ 1',
    jenjang: 'SMK',
    teacherCode: 'GRU-003',
    teacherName: 'Budi Santoso, S.T.',
    subject: 'Informatika & Jaringan',
    periodNumber: 1,
    periodTime: '07:00 - 07:45',
    status: 'DUTY',
    notes: 'Tugas Dinas Lomba Robotik Kejuruan',
    lastUpdatedBy: 'Ketua Piket (Drs. H. Ahmad Dahlan)',
  },
  {
    id: 'att-5',
    className: 'VII A',
    jenjang: 'SMP',
    teacherCode: 'GRU-004',
    teacherName: 'Dewi Lestari, M.Sc.',
    subject: 'IPA Terpadu',
    periodNumber: 4,
    periodTime: '09:30 - 10:15',
    status: 'PRESENT',
    notes: 'Hadir di laboratorium IPA',
    lastUpdatedBy: 'Petugas Piket (Rina Wijaya)',
  },
  {
    id: 'att-6',
    className: 'VIII B',
    jenjang: 'SMP',
    teacherCode: 'GRU-005',
    teacherName: 'Ahmad Fauzi, S.Ag.',
    subject: 'Pendidikan Agama Islam',
    periodNumber: 1,
    periodTime: '07:00 - 07:45',
    status: 'PRESENT',
    notes: 'Hadir mengajar',
    lastUpdatedBy: 'Petugas Piket (Ahmad Fauzi)',
  },
  {
    id: 'att-7',
    className: 'XI RPL 2',
    jenjang: 'SMK',
    teacherCode: 'GRU-006',
    teacherName: 'Rina Wijaya, S.Kom.',
    subject: 'Pemrograman Web',
    periodNumber: 2,
    periodTime: '07:45 - 08:30',
    status: 'NOT_RECORDED',
    notes: 'Belum diverifikasi petugas piket',
  },
  {
    id: 'att-8',
    className: 'XI IPA 2',
    jenjang: 'SMA',
    teacherCode: 'GRU-007',
    teacherName: 'Hendra Saputra, S.Pd.',
    subject: 'Penjaskes',
    periodNumber: 3,
    periodTime: '08:30 - 09:15',
    status: 'NOT_RECORDED',
    notes: 'Belum ada laporan dari lapangan olahraga',
  },
];

export default function KetuaPiketAttendancePage() {
  const [attendanceList, setAttendanceList] = useState<AttendanceItem[]>(initialAttendanceData);
  const [selectedJenjang, setSelectedJenjang] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Direct Attendance Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AttendanceItem | null>(null);
  const [newStatus, setNewStatus] = useState<AttendanceItem['status']>('PRESENT');
  const [notesInput, setNotesInput] = useState('');

  // Sync with localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('simogu_ketua_attendance');
      if (stored) {
        setAttendanceList(JSON.parse(stored));
      } else {
        localStorage.setItem('simogu_ketua_attendance', JSON.stringify(initialAttendanceData));
      }
    } catch (e) {}
  }, []);

  const filteredList = attendanceList.filter((item) => {
    const matchJenjang = selectedJenjang === 'Semua' || item.jenjang === selectedJenjang;
    const matchStatus =
      statusFilter === 'Semua'
        ? true
        : statusFilter === 'HADIR'
        ? item.status === 'PRESENT'
        : statusFilter === 'NON_HADIR'
        ? item.status === 'PERMISSION' || item.status === 'DUTY' || item.status === 'SICK' || item.status === 'ABSENT'
        : item.status === 'NOT_RECORDED';

    const matchSearch =
      !searchQuery ||
      item.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.className.toLowerCase().includes(searchQuery.toLowerCase());

    return matchJenjang && matchStatus && matchSearch;
  });

  const handleOpenAbsenModal = (item: AttendanceItem) => {
    setSelectedItem(item);
    setNewStatus(item.status === 'NOT_RECORDED' ? 'PRESENT' : item.status);
    setNotesInput(item.notes || '');
    setModalOpen(true);
  };

  const handleSaveAttendance = () => {
    if (!selectedItem) return;

    const updatedList = attendanceList.map((item) => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          status: newStatus,
          notes: notesInput.trim() || 'Diabsen & diverifikasi langsung oleh Ketua Petugas Piket',
          lastUpdatedBy: 'Ketua Piket (Drs. H. Ahmad Dahlan)',
        };
      }
      return item;
    });

    setAttendanceList(updatedList);

    try {
      localStorage.setItem('simogu_ketua_attendance', JSON.stringify(updatedList));
    } catch (e) {}

    setToastMessage(`Presensi ${selectedItem.teacherName} (${selectedItem.className}) berhasil diperbarui & diverifikasi!`);
    setTimeout(() => setToastMessage(null), 4000);

    setModalOpen(false);
    setSelectedItem(null);
  };

  const presentCount = attendanceList.filter((i) => i.status === 'PRESENT').length;
  const nonHadirCount = attendanceList.filter(
    (i) => i.status === 'PERMISSION' || i.status === 'DUTY' || i.status === 'SICK' || i.status === 'ABSENT'
  ).length;
  const pendingCount = attendanceList.filter((i) => i.status === 'NOT_RECORDED').length;

  return (
    <div className="min-h-screen transition-colors duration-500 p-3 sm:p-6 relative">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 relative z-10">

        {/* Top Header Bar */}
        <header className="p-3.5 sm:p-4 glass-card rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link
              href="/ketua-piket/dashboard"
              className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
              title="Kembali ke Dashboard Ketua Piket"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 tracking-tight truncate">
                  Kontrol & Presensi Kelas
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                  Otoritas Ketua Piket
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Pantau kehadiran real-time kelas & lakukan pengabsenan langsung
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/settings/profile"
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Profil"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <ThemeToggle />
            <LogoutButton size="sm" />
          </div>
        </header>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* KPI Summary Strip */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-2xl glass-card border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-300">Hadir Terverifikasi</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {presentCount}
              </span>
              <span className="text-[10px] text-slate-400">jam</span>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl glass-card border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20">
            <span className="text-[10px] sm:text-xs font-bold text-rose-700 dark:text-rose-300">Izin / Dinas / Sakit</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {nonHadirCount}
              </span>
              <span className="text-[10px] text-slate-400">jam</span>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl glass-card border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20">
            <span className="text-[10px] sm:text-xs font-bold text-amber-700 dark:text-amber-300">Belum Diabsen</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {pendingCount}
              </span>
              <span className="text-[10px] text-slate-400">jam</span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Status Filter Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto">
              {[
                { key: 'Semua', label: 'Semua Status' },
                { key: 'HADIR', label: '✓ Hadir' },
                { key: 'NON_HADIR', label: '✕ Izin/Dinas/Sakit' },
                { key: 'PENDING', label: '⏳ Belum Diabsen' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                    statusFilter === tab.key
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Jenjang Filter & Search */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex gap-1">
                {['Semua', 'SMP', 'SMA', 'SMK'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedJenjang(lvl)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedJenjang === lvl
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kelas / guru..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Attendance Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredList.length === 0 ? (
            <div className="col-span-full glass-card p-10 rounded-2xl text-center text-slate-500">
              Tidak ada jadwal presensi yang sesuai dengan filter.
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                className="glass-card p-4 rounded-2xl space-y-3 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs">
                        {item.className}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                        {item.jenjang}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                        Jam {item.periodNumber} ({item.periodTime})
                      </span>
                    </div>

                    {/* Status Badge */}
                    {item.status === 'PRESENT' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        ✓ Hadir
                      </span>
                    )}
                    {item.status === 'PERMISSION' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        📋 Izin Resmi
                      </span>
                    )}
                    {item.status === 'DUTY' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                        🏛️ Tugas Dinas
                      </span>
                    )}
                    {item.status === 'SICK' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                        🏥 Sakit
                      </span>
                    )}
                    {item.status === 'ABSENT' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        ✕ Alpa
                      </span>
                    )}
                    {item.status === 'NOT_RECORDED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                        ⏳ Belum Diabsen
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-50">
                      {item.teacherName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.subject} • <span className="font-mono text-[11px]">{item.teacherCode}</span>
                    </p>
                  </div>

                  {item.notes && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      "{item.notes}"
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 truncate">
                    {item.lastUpdatedBy ? `Oleh: ${item.lastUpdatedBy}` : 'Belum diverifikasi'}
                  </span>

                  <button
                    onClick={() => handleOpenAbsenModal(item)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-600/25 transition-all shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ubah / Absen Langsung</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Modal Dialog: Absen Langsung oleh Ketua Piket */}
      {modalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    Otoritas Presensi Ketua Piket
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedItem.className} • Jam {selectedItem.periodNumber} ({selectedItem.periodTime})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs">
              <div>Pengajar: <strong className="text-slate-800 dark:text-slate-200">{selectedItem.teacherName}</strong></div>
              <div>Mata Pelajaran: <span>{selectedItem.subject}</span></div>
            </div>

            {/* Status Options */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilih Status Kehadiran Guru:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'PRESENT', label: '✓ Hadir di Kelas', color: 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40' },
                  { value: 'PERMISSION', label: '📋 Izin Resmi', color: 'border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/40' },
                  { value: 'DUTY', label: '🏛️ Tugas Dinas', color: 'border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/40' },
                  { value: 'SICK', label: '🏥 Sakit', color: 'border-purple-500 text-purple-700 bg-purple-50 dark:bg-purple-950/40' },
                  { value: 'ABSENT', label: '✕ Alpa / Tanpa Ket.', color: 'border-rose-500 text-rose-700 bg-rose-50 dark:bg-rose-950/40' },
                ].map((st) => (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => setNewStatus(st.value as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      newStatus === st.value
                        ? `${st.color} ring-2 ring-indigo-500`
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes / Reason */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Catatan Verifikasi Ketua Piket:
              </label>
              <input
                type="text"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Contoh: Terverifikasi hadir di kelas tepat waktu"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAttendance}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan & Verifikasi Langsung</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Footer />
      </div>
    </div>
  );
}
