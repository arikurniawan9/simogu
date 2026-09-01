'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogoutButton } from '@/components/logout-button';
import { Footer } from '@/components/footer';
import { ConfirmationModal } from '@/components/confirmation-modal';
import {
  Users,
  ArrowLeft,
  Plus,
  Search,
  Phone,
  BookOpen,
  MessageSquare,
  Building2,
  CheckCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface UstadzItem {
  id: string;
  teacherCode: string;
  fullName: string;
  subject: string;
  gender: string;
  whatsappNumber: string;
  isActive: boolean;
}

const initialUstadz: UstadzItem[] = [
  { id: 't-1', teacherCode: 'UST-001', fullName: 'Ust. Ahmad Fauzi, S.Ag.', subject: 'Nahwu & Tafsir', gender: 'MALE', whatsappNumber: '6281234567805', isActive: true },
  { id: 't-2', teacherCode: 'UST-002', fullName: 'Ust. Ridwan Kamil, S.Pd.I', subject: 'Tahfidz 30 Juz & Tahsin', gender: 'MALE', whatsappNumber: '6281234567806', isActive: true },
  { id: 't-3', teacherCode: 'UST-003', fullName: 'Ust. Budi Santoso, S.T.', subject: 'Fiqih Ibadah', gender: 'MALE', whatsappNumber: '6281234567803', isActive: true },
  { id: 't-4', teacherCode: 'UST-004', fullName: 'K.H. Syamsul Arifin, Lc.', subject: 'Hadits Riyadhus Shalihin', gender: 'MALE', whatsappNumber: '6281234567804', isActive: true },
  { id: 't-5', teacherCode: 'UST-005', fullName: 'Drs. Ari Kurniawan, M.Pd.', subject: 'Fiqih Fathul Qorib', gender: 'MALE', whatsappNumber: '6281234567801', isActive: true },
  { id: 't-6', teacherCode: 'UST-006', fullName: 'Ustdzh. Siti Rahma, S.Pd.', subject: 'Shorof & I\'lal', gender: 'FEMALE', whatsappNumber: '6281234567802', isActive: true },
  { id: 't-7', teacherCode: 'UST-007', fullName: 'Ust. Zulkifli Al-Hafidz', subject: 'Tahfidz & Badal Khusus', gender: 'MALE', whatsappNumber: '6281234567811', isActive: true },
];

export default function PengajianTeachersPage() {
  const [teachers, setTeachers] = useState<UstadzItem[]>(initialUstadz);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal create
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    teacherCode: '',
    fullName: '',
    subject: '',
    gender: 'MALE',
    whatsappNumber: '',
  });

  // Alert
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDesc, setAlertDesc] = useState('');

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    try {
      const res = await apiClient.get<UstadzItem[]>('/api/v1/teachers');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setTeachers(res.data);
      }
    } catch {
      // fallback
    }
  }

  const handleOpenAdd = () => {
    setFormData({
      teacherCode: `UST-00${teachers.length + 1}`,
      fullName: '',
      subject: '',
      gender: 'MALE',
      whatsappNumber: '628',
    });
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    try {
      const res = await apiClient.post<UstadzItem>('/api/v1/teachers', formData);
      const newUstadz = res.data || {
        id: `t-${Date.now()}`,
        teacherCode: formData.teacherCode,
        fullName: formData.fullName,
        subject: formData.subject,
        gender: formData.gender,
        whatsappNumber: formData.whatsappNumber,
        isActive: true,
      };
      setTeachers((prev) => [newUstadz, ...prev]);
    } catch {
      const newUstadz: UstadzItem = {
        id: `t-${Date.now()}`,
        teacherCode: formData.teacherCode,
        fullName: formData.fullName,
        subject: formData.subject,
        gender: formData.gender,
        whatsappNumber: formData.whatsappNumber,
        isActive: true,
      };
      setTeachers((prev) => [newUstadz, ...prev]);
    }

    setAlertTitle('Ustadz Ditambahkan');
    setAlertDesc(`Ustadz "${formData.fullName}" berhasil didaftarkan sebagai pengajar pengajian.`);
    setAlertOpen(true);
    setIsFormModalOpen(false);
  };

  const filtered = teachers.filter(
    (t) =>
      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.teacherCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <span>Data Ustadz & Pengajar Pengajian</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daftar asatidz pengampu kitab kuning, tahfidz, dan diniyah boarding school
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
              <span>Tambah Ustadz</span>
            </button>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        {/* Search Bar */}
        <div className="glass-card p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama ustadz, kitab yang diampu, atau kode..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
            Total: {filtered.length} Ustadz
          </span>
        </div>

        {/* Ustadz Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    {item.teacherCode}
                  </span>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 mt-1">
                    {item.fullName}
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-black text-xs shrink-0">
                  {item.fullName.charAt(0)}
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Kajian: {item.subject}</span>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1 font-mono text-[11px]">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {item.whatsappNumber}
                </span>

                <a
                  href={`https://wa.me/${item.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold flex items-center gap-1 text-[11px] transition-all"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <Footer />

      </div>

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Tambah Ustadz / Guru Pengajian
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kode Ustadz:
                </label>
                <input
                  type="text"
                  required
                  value={formData.teacherCode}
                  onChange={(e) => setFormData({ ...formData, teacherCode: e.target.value })}
                  placeholder="UST-001"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama Lengkap (beserta gelar):
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Contoh: Ust. M. Ihsan, Lc."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kitab / Bidang yang Diampu:
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Contoh: Nahwu, Fiqih, Tahfidz Juz 30"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nomor WhatsApp Aktif:
                </label>
                <input
                  type="text"
                  required
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="Contoh: 628123456789"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
                >
                  Simpan Ustadz
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
