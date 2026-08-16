'use client';

import React, { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Footer } from '@/components/footer';
import { Search, UserCheck, ArrowRight, ArrowLeft, BookOpen, Shield, GraduationCap, Building2, Wrench, Home } from 'lucide-react';
import Link from 'next/link';

export type EducationLevel = 'SMP' | 'SMA' | 'SMK';

interface PublicTeacher {
  id: string;
  teacherCode: string;
  fullName: string;
  subject: string;
  jenjangList: EducationLevel[];
}

const samplePublicTeachers: PublicTeacher[] = [
  { id: '1', teacherCode: 'GRU-001', fullName: 'Drs. Ari Kurniawan, M.Pd.', subject: 'Matematika & Fisika', jenjangList: ['SMP', 'SMA'] },
  { id: '2', teacherCode: 'GRU-002', fullName: 'Siti Rahma, S.Pd.', subject: 'Bahasa Indonesia', jenjangList: ['SMP'] },
  { id: '3', teacherCode: 'GRU-003', fullName: 'Budi Santoso, S.T.', subject: 'Fisika & Informatika', jenjangList: ['SMA', 'SMK'] },
  { id: '4', teacherCode: 'GRU-004', fullName: 'Dewi Lestari, M.Sc.', subject: 'Biologi', jenjangList: ['SMA'] },
  { id: '5', teacherCode: 'GRU-005', fullName: 'Ahmad Fauzi, S.Ag.', subject: 'Pendidikan Agama', jenjangList: ['SMP', 'SMA', 'SMK'] },
  { id: '6', teacherCode: 'GRU-006', fullName: 'Rina Wijaya, S.Kom.', subject: 'Jaringan & Web', jenjangList: ['SMK'] },
];

export default function PublicGuruSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Lazy Display: Data is NOT displayed initially until searchQuery is entered
  const isSearchActive = searchQuery.trim().length > 0;

  const filteredTeachers = isSearchActive
    ? samplePublicTeachers.filter(
        (t) =>
          t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.teacherCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.jenjangList.some((j) => j.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : [];

  const renderJenjangBadges = (jenjangList: EducationLevel[]) => {
    const badges: Record<EducationLevel, { label: string; cls: string }> = {
      SMP: { label: 'SMP', cls: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' },
      SMA: { label: 'SMA', cls: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800' },
      SMK: { label: 'SMK', cls: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
    };

    return (
      <div className="flex items-center gap-1">
        {jenjangList.map((j) => {
          const b = badges[j] || badges.SMA;
          return (
            <span key={j} className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${b.cls}`}>
              {b.label}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen transition-colors duration-500 p-4 sm:p-6 relative">
      {/* Floating Animated Ambient Blobs */}
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">

        {/* Header Bar */}
        <header className="flex items-center justify-between p-4 glass-card rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/25 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                Portal Informasi & Publikasi Guru
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencarian transparan status & jadwal mengajar guru sekolah (SMP / SMA / SMK)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Beranda
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {/* Search Bar Input Container */}
        <div className="glass-card p-6 rounded-lg space-y-4 border-l-4 border-l-brand-600 shadow-xl shadow-brand-500/5">
          <div className="text-center space-y-1.5 max-w-lg mx-auto">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              Pencarian Jadwal Mengajar Guru
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Ketik nama guru, kode unik pengajar (misal: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">GRU-001</span>), atau mata pelajaran di bawah untuk menampilkan data.
            </p>
          </div>

          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-600 dark:text-brand-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketikkan kode guru, nama lengkap, atau mata pelajaran..."
              className="w-full pl-12 pr-10 py-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-sm font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Conditional Content Display */}
        {!isSearchActive ? (
          /* Initial Empty State Banner */
          <div className="glass-card p-8 sm:p-12 rounded-lg text-center space-y-4 border border-dashed border-slate-300 dark:border-slate-800 shadow-lg">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-950 dark:to-slate-900 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center shadow-inner shadow-brand-500/10">
              <Search className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Data Guru Belum Ditampilkan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Silakan ketikkan kata kunci pencarian pada kotak di atas untuk menemukan jadwal mengajar dan status kehadiran guru sekolah Anda.
              </p>
            </div>
          </div>
        ) : filteredTeachers.length === 0 ? (
          /* No Results Found State */
          <div className="glass-card p-8 rounded-lg text-center space-y-3 border border-rose-200 dark:border-rose-900/50">
            <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
              Tidak ditemukan data guru dengan kata kunci &quot;{searchQuery}&quot;
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Coba periksa kembali ejaan nama guru atau kode pengajar (contoh: GRU-001).
            </p>
          </div>
        ) : (
          /* Results Grid Cards */
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1 flex items-center justify-between">
              <span>Hasil Pencarian Guru ({filteredTeachers.length})</span>
              <span className="text-[11px] text-brand-600 font-mono">Kata kunci: &quot;{searchQuery}&quot;</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredTeachers.map((teacher) => (
                <Link
                  key={teacher.id}
                  href={`/guru/${teacher.teacherCode}`}
                  className="glass-card p-5 rounded-lg flex items-center justify-between hover:scale-[1.02] transition-all group border border-slate-200/80 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-md bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm">
                      {teacher.teacherCode}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-600 transition-colors">
                          {teacher.fullName}
                        </h3>
                      </div>
                      {renderJenjangBadges(teacher.jenjangList)}
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-0.5">
                        <BookOpen className="w-3.5 h-3.5 text-brand-600 shrink-0" /> {teacher.subject}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Global Footer */}
        <Footer />

      </div>
    </div>
  );
}
