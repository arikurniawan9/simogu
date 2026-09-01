'use client';

import React, { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Footer } from '@/components/footer';
import { Search, UserCheck, ArrowRight, ArrowLeft, BookOpen, Shield, GraduationCap, Building2, Wrench, Home, Filter, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { apiClient } from '@/lib/api-client';

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
  const [selectedJenjangFilter, setSelectedJenjangFilter] = useState<string>('Semua');
  const [liveTeachers, setLiveTeachers] = useState<PublicTeacher[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Lazy Display: Data is NOT displayed initially until searchQuery is entered OR filter is selected
  const isSearchActive = searchQuery.trim().length > 0 || selectedJenjangFilter !== 'Semua';

  React.useEffect(() => {
    if (!isSearchActive) {
      setLiveTeachers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await apiClient.get<any[]>(`/api/v1/teachers/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped: PublicTeacher[] = res.data.map((t) => ({
          id: t.id,
          teacherCode: t.teacherCode,
          fullName: t.fullName,
          subject: t.subject || 'Umum',
          jenjangList: ['SMA'], // Default jenjang or from class schedules
        }));
        setLiveTeachers(mapped);
      } else if (res.success && Array.isArray(res.data) && res.data.length === 0 && searchQuery.trim()) {
        setLiveTeachers([]);
      } else {
        // Fallback to local sample data if API returned no match or error
        const fallback = samplePublicTeachers.filter((t) => {
          const matchesQuery =
            !searchQuery.trim() ||
            t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.teacherCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.subject.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesQuery;
        });
        setLiveTeachers(fallback);
      }
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearchActive]);

  const filteredTeachers = isSearchActive
    ? liveTeachers.filter((t) => {
        const matchesJenjang =
          selectedJenjangFilter === 'Semua' ||
          t.jenjangList.includes(selectedJenjangFilter as EducationLevel);
        return matchesJenjang;
      })
    : [];

  const renderJenjangBadges = (jenjangList: EducationLevel[]) => {
    const badges: Record<EducationLevel, { label: string; cls: string }> = {
      SMP: { label: 'SMP', cls: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' },
      SMA: { label: 'SMA', cls: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800' },
      SMK: { label: 'SMK', cls: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800' },
    };

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {jenjangList.map((j) => {
          const b = badges[j] || badges.SMA;
          return (
            <span key={j} className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${b.cls}`}>
              {b.label}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen transition-colors duration-500 p-3 sm:p-6 relative">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 relative z-10">

        {/* Header Bar */}
        <header className="flex items-center justify-between p-3.5 sm:p-4 glass-card rounded-2xl">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/25 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
                Pencarian Guru
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                Transparansi jadwal & status mengajar pengajar
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Search Bar Input Container */}
        <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4 border-l-4 border-l-brand-600 shadow-xl shadow-brand-500/5">
          <div className="text-center space-y-1 max-w-lg mx-auto">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              Cari Jadwal & Kehadiran Guru
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Ketik nama guru, kode pengajar (misal: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">GRU-001</span>), atau mapel.
            </p>
          </div>

          {/* Quick Jenjang Filter Chips for mobile touch */}
          <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1">
            {['Semua', 'SMP', 'SMA', 'SMK'].map((jenjang) => (
              <button
                key={jenjang}
                onClick={() => setSelectedJenjangFilter(jenjang)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedJenjangFilter === jenjang
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {jenjang === 'Semua' ? 'Semua Jenjang' : `Jenjang ${jenjang}`}
              </button>
            ))}
          </div>

          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-600 dark:text-brand-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik nama, kode guru (GRU-001), atau mapel..."
              className="w-full pl-11 pr-16 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Conditional Content Display */}
        {!isSearchActive ? (
          /* Initial Empty State Banner */
          <div className="glass-card p-6 sm:p-12 rounded-2xl text-center space-y-3 border border-dashed border-slate-300 dark:border-slate-800 shadow-lg">
            <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-950 dark:to-slate-900 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center shadow-inner shadow-brand-500/10">
              <Search className="w-7 sm:w-8 h-7 sm:h-8 animate-pulse" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Pencarian Guru Siap Digunakan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ketik kata kunci atau pilih jenjang di atas untuk langsung menampilkan data pengajar dan riwayat kehadiran.
              </p>
            </div>
          </div>
        ) : filteredTeachers.length === 0 ? (
          /* No Results Found State */
          <div className="glass-card p-6 rounded-2xl text-center space-y-2 border border-rose-200 dark:border-rose-900/50">
            <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
              Tidak ditemukan data guru dengan kata kunci &quot;{searchQuery}&quot;
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Coba periksa kembali ejaan nama atau pilih jenjang lain.
            </p>
          </div>
        ) : (
          /* Results Grid Cards */
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1 flex items-center justify-between">
              <span>Hasil Pencarian ({filteredTeachers.length} Guru)</span>
              <span className="text-[11px] text-brand-600 font-mono">
                {selectedJenjangFilter !== 'Semua' ? `Jenjang: ${selectedJenjangFilter}` : 'Semua'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {filteredTeachers.map((teacher) => (
                <Link
                  key={teacher.id}
                  href={`/guru/${teacher.teacherCode}`}
                  className="glass-card p-4 sm:p-5 rounded-2xl flex items-center justify-between hover:scale-[1.01] active:scale-[0.99] transition-all group border border-slate-200/80 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-sm border border-brand-200 dark:border-brand-900">
                      {teacher.teacherCode}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-600 transition-colors truncate">
                        {teacher.fullName}
                      </h3>
                      {renderJenjangBadges(teacher.jenjangList)}
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate pt-0.5">
                        <BookOpen className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span className="truncate">{teacher.subject}</span>
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
