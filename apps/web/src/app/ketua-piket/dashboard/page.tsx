'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogoutButton } from '@/components/logout-button';
import { Footer } from '@/components/footer';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Calendar,
  Users,
  AlertCircle,
  ArrowRight,
  ClipboardCheck,
  Building2,
  Printer,
  ChevronRight,
  User,
} from 'lucide-react';

interface EditRequest {
  id: string;
  teacherName?: string;
  className?: string;
  jenjang?: string;
  subject?: string;
  periodTime?: string;
  currentStatus?: string;
  requestedStatus?: string;
  requesterName: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const initialMockRequests: EditRequest[] = [
  {
    id: 'req-101',
    teacherName: 'Siti Rahma, S.Pd.',
    className: 'X IPA 1',
    jenjang: 'SMA',
    subject: 'Bahasa Indonesia',
    periodTime: '07:45 - 08:30',
    currentStatus: 'ABSENT_PENDING_CONFIRMATION',
    requestedStatus: 'PERMISSION',
    requesterName: 'Piket 1 (Ahmad Fauzi)',
    reason: 'Guru menyerahkan surat izin resmi MGMP & konfirmasi WA',
    status: 'PENDING',
    createdAt: '07:50 WIB',
  },
  {
    id: 'req-102',
    teacherName: 'Budi Santoso, S.T.',
    className: 'X TKJ 1',
    jenjang: 'SMK',
    subject: 'Informatika',
    periodTime: '09:30 - 10:15',
    currentStatus: 'ABSENT_PENDING_CONFIRMATION',
    requestedStatus: 'OFFICIAL_DUTY',
    requesterName: 'Piket 2 (Rina Wijaya)',
    reason: 'Surat tugas mendampingi lomba robotik kejuruan tingkat kota',
    status: 'PENDING',
    createdAt: '09:35 WIB',
  },
];

export default function KetuaPiketDashboardPage() {
  const [requests, setRequests] = useState<EditRequest[]>(initialMockRequests);
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    // Set Indonesian locale date
    const now = new Date();
    const formatted = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    setCurrentDateStr(formatted);

    // Sync with localStorage
    try {
      const stored = localStorage.getItem('simogu_edit_requests');
      if (stored) {
        const parsed = JSON.parse(stored) as EditRequest[];
        if (parsed && parsed.length > 0) {
          setRequests(parsed);
        }
      } else {
        localStorage.setItem('simogu_edit_requests', JSON.stringify(initialMockRequests));
      }
    } catch (e) {}
  }, []);

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const approvedRequests = requests.filter((r) => r.status === 'APPROVED');

  return (
    <div className="min-h-screen transition-colors duration-500 p-3 sm:p-6 relative">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 relative z-10">

        {/* Top Header Bar */}
        <header className="p-3.5 sm:p-4 glass-card rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 tracking-tight">
                  Ketua Petugas Piket
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                  Otoritas ACC
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentDateStr || 'Sistem Monitoring Presensi Guru'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/settings/profile"
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Profil Ketua Piket"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <ThemeToggle />
            <LogoutButton size="sm" />
          </div>
        </header>

        {/* Hero Welcome & Status Alert Banner */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-xl shadow-indigo-600/15 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md">
                <Clock className="w-3.5 h-3.5" /> Piket Aktif: Hari Ini
              </span>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-snug">
                Pusat Persetujuan & Rekapitulasi Presensi
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                Anda memiliki wewenang untuk meninjau dan meng-ACC ajuan perubahan status guru dari petugas piket, serta mencetak rekap kehadiran resmi.
              </p>
            </div>

            <div className="flex flex-row sm:flex-col gap-2 shrink-0">
              <Link
                href="/ketua-piket/approvals"
                className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <span>Tinjau ACC</span>
                {pendingRequests.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                    {pendingRequests.length}
                  </span>
                )}
              </Link>
              <Link
                href="/ketua-piket/reports"
                className="px-4 py-2.5 rounded-xl bg-indigo-800/80 hover:bg-indigo-800 text-white border border-indigo-400/30 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Rekap</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <Link
            href="/ketua-piket/approvals"
            className={`p-3.5 sm:p-4 rounded-2xl glass-card border transition-all active:scale-[0.98] ${
              pendingRequests.length > 0
                ? 'border-amber-400/70 dark:border-amber-500/50 bg-amber-50/40 dark:bg-amber-950/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Menunggu ACC</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                {pendingRequests.length}
              </span>
              <span className="text-[10px] text-slate-400">permohonan</span>
            </div>
          </Link>

          <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Guru Piket</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
                24
              </span>
              <span className="text-[10px] text-slate-400">guru aktif</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Sudah Di-ACC</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {approvedRequests.length || 4}
              </span>
              <span className="text-[10px] text-slate-400">disetujui</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Presensi Guru</span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0">
                <ClipboardCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                95.8%
              </span>
              <span className="text-[10px] text-slate-400">hadir hari ini</span>
            </div>
          </div>
        </div>

        {/* Action Shortcuts Grid */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
            Menu Utama Ketua Piket
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/ketua-piket/approvals"
              className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 truncate">
                    ACC Ajuan Edit Presensi
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {pendingRequests.length} permohonan butuh persetujuan
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
            </Link>

            <Link
              href="/ketua-piket/reports"
              className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 truncate">
                    Rekap & Cetak Laporan
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Format Harian, Mingguan, Bulanan
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
            </Link>

            <Link
              href="/ketua-piket/attendance"
              className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 truncate">
                    Pantau Presensi Kelas
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Verifikasi kehadiran jam ke-1 s/d 8
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
            </Link>
          </div>
        </div>

        {/* Live Pending Approvals Section */}
        <div className="glass-card p-4 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Daftar Permohonan Edit Presensi Terbaru
              </h3>
              <p className="text-[11px] text-slate-500">
                Ajuan perubahan status kehadiran dari Guru Piket yang membutuhkan ACC Anda
              </p>
            </div>

            <Link
              href="/ketua-piket/approvals"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Lihat Semua ({requests.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Semua Ajuan Edit Telah Ditinjau
              </p>
              <p className="text-[11px] text-slate-500">
                Tidak ada permohonan baru yang membutuhkan persetujuan saat ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {item.teacherName}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                        {item.className} ({item.jenjang})
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.periodTime}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Diajukan oleh: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.requesterName}</span>
                      <span className="mx-1.5">•</span>
                      Alasan: <span className="italic">{item.reason || 'Tidak ada catatan'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] pt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
                        Status Lama: {item.currentStatus}
                      </span>
                      <span>➔</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                        Diubah Ke: {item.requestedStatus}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/ketua-piket/approvals"
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all self-end sm:self-auto shrink-0"
                  >
                    <span>Tinjau & ACC</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="mt-8">
        <Footer />
      </div>
    </div>
  );
}
