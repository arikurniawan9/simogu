'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogoutButton } from '@/components/logout-button';
import { Footer } from '@/components/footer';
import { ConfirmationModal } from '@/components/confirmation-modal';
import {
  BookOpen,
  ArrowLeft,
  Plus,
  Search,
  MapPin,
  Layers,
  Edit2,
  Trash2,
  CheckCircle2,
  Building2,
  Calendar,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface HalaqahItem {
  id: string;
  name: string;
  category: string;
  location?: string | null;
  description?: string | null;
  isActive: boolean;
  _count?: { schedules: number };
}

const initialHalaqah: HalaqahItem[] = [
  { id: 'c-1', name: 'Halaqah Al-Jurumiyah (Nahwu A)', category: 'Kitab Kuning', location: 'Masjid Utama Lt. 1', description: 'Kajian kaidah nahwu shorof tingkat dasar', isActive: true, _count: { schedules: 3 } },
  { id: 'c-2', name: 'Halaqah Fathul Qorib (Fiqih)', category: 'Kitab Kuning', location: 'Masjid Utama Lt. 2', description: 'Kajian fiqih ibadah madzhab Syafi\'i', isActive: true, _count: { schedules: 3 } },
  { id: 'c-3', name: 'Halaqah Tahfidz Al-Qur\'an Putra', category: 'Tahfidz', location: 'Gedung Tahfidz Lt. 1', description: 'Setoran hafalan 30 juz dan tahsin tilawah', isActive: true, _count: { schedules: 3 } },
  { id: 'c-4', name: 'Halaqah Safinatun Najah', category: 'Diniyah', location: 'Asrama Putra Al-Ghazali', description: 'Dasar-dasar aqidah dan tata cara sholat', isActive: true, _count: { schedules: 3 } },
  { id: 'c-5', name: 'Halaqah Riyadhus Shalihin', category: 'Hadits', location: 'Aula Utama Pesantren', description: 'Hadits nabawi & tazkiyatun nafs', isActive: true, _count: { schedules: 3 } },
];

export default function PengajianClassesPage() {
  const [classes, setClasses] = useState<HalaqahItem[]>(initialHalaqah);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal create/edit
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Kitab Kuning',
    location: '',
    description: '',
  });

  // Modal alert
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDesc, setAlertDesc] = useState('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'warning' | 'danger' | 'info'>('info');

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    try {
      const res = await apiClient.get<HalaqahItem[]>('/api/v1/pengajian/classes');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setClasses(res.data);
      }
    } catch {
      // keep fallback
    }
  }

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'Kitab Kuning',
      location: '',
      description: '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: HalaqahItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      location: item.location || '',
      description: item.description || '',
    });
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingId) {
        await apiClient.put(`/api/v1/pengajian/classes/${editingId}`, formData);
        setClasses((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...formData } : c))
        );
        setAlertTitle('Halaqah Diperbarui');
        setAlertDesc(`Data halaqah "${formData.name}" berhasil diperbarui.`);
      } else {
        const res = await apiClient.post<HalaqahItem>('/api/v1/pengajian/classes', formData);
        const newClass: HalaqahItem = res.data || {
          id: `c-${Date.now()}`,
          name: formData.name,
          category: formData.category,
          location: formData.location,
          description: formData.description,
          isActive: true,
          _count: { schedules: 0 },
        };
        setClasses((prev) => [newClass, ...prev]);
        setAlertTitle('Halaqah Ditambahkan');
        setAlertDesc(`Halaqah baru "${formData.name}" berhasil didaftarkan.`);
      }
      setAlertVariant('success');
      setAlertOpen(true);
      setIsFormModalOpen(false);
    } catch {
      // local mock update
      if (editingId) {
        setClasses((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...formData } : c))
        );
      } else {
        const newClass: HalaqahItem = {
          id: `c-${Date.now()}`,
          name: formData.name,
          category: formData.category,
          location: formData.location,
          description: formData.description,
          isActive: true,
          _count: { schedules: 0 },
        };
        setClasses((prev) => [newClass, ...prev]);
      }
      setAlertTitle('Halaqah Tersimpan');
      setAlertDesc(`Data halaqah "${formData.name}" tersimpan.`);
      setAlertVariant('success');
      setAlertOpen(true);
      setIsFormModalOpen(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus halaqah "${name}"?`)) {
      try {
        await apiClient.delete(`/api/v1/pengajian/classes/${id}`);
      } catch {
        // ignore
      }
      setClasses((prev) => prev.filter((c) => c.id !== id));
      setAlertTitle('Halaqah Dihapus');
      setAlertDesc(`Halaqah "${name}" telah dinonaktifkan.`);
      setAlertVariant('warning');
      setAlertOpen(true);
    }
  };

  const filtered = classes.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.location && c.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    return matchSearch && matchCategory;
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
                <span>Manajemen Halaqah & Kelas Pengajian</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Input dan atur kelompok belajar kitab, tahfidz, dan diniyah pesantren
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
              <span>Tambah Halaqah</span>
            </button>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        {/* Filter Bar */}
        <div className="glass-card p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama halaqah atau lokasi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'Kitab Kuning', 'Tahfidz', 'Diniyah', 'Hadits'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
              >
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Halaqah Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {item._count?.schedules || 0} Jadwal Sesi
                  </span>
                </div>

                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                  {item.name}
                </h3>

                {item.location && (
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    <span>{item.location}</span>
                  </div>
                )}

                {item.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
                <Link
                  href={`/pengajian/schedules?classId=${item.id}`}
                  className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Jadwal Pengajian</span>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all"
                    title="Edit Halaqah"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all"
                    title="Hapus Halaqah"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global Footer */}
        <Footer />

      </div>

      {/* Form Modal (Create / Edit) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              {editingId ? 'Edit Halaqah Pengajian' : 'Tambah Halaqah Baru'}
            </h2>

            <form onSubmit={handleSubmitForm} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama Halaqah / Kelompok:
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Halaqah Al-Jurumiyah A"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kategori Pengajian:
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Kitab Kuning">Kitab Kuning</option>
                  <option value="Tahfidz">Tahfidz</option>
                  <option value="Diniyah">Diniyah</option>
                  <option value="Hadits">Hadits</option>
                  <option value="Sorogan">Sorogan</option>
                  <option value="Bandongan">Bandongan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Lokasi Halaqah:
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Contoh: Masjid Utama Lt. 1 / Asrama Umar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Keterangan / Deskripsi:
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Keterangan materi pengajian..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  Simpan Halaqah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <ConfirmationModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        onConfirm={() => setAlertOpen(false)}
        title={alertTitle}
        description={alertDesc}
        variant={alertVariant}
        confirmText="Tutup"
      />
    </div>
  );
}
