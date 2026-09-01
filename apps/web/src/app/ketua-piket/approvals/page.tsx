'use client';

import React, { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { Footer } from '@/components/footer';
import { LogoutButton } from '@/components/logout-button';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ArrowLeft,
  Paperclip,
  Check,
  X,
  AlertTriangle,
  User,
  Filter,
  Search,
} from 'lucide-react';
import Link from 'next/link';

interface ChangeRequestItem {
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
  attachmentUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

const sampleRequests: ChangeRequestItem[] = [
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
    reason: 'Guru menyerahkan surat izin resmi MGMP & konfirmasi via WA',
    attachmentUrl: 'https://example.com/surat-izin-mgmp.pdf',
    status: 'PENDING',
    createdAt: 'Hari Ini, 07:50 WIB',
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
    createdAt: 'Hari Ini, 09:35 WIB',
  },
  {
    id: 'req-103',
    teacherName: 'Ahmad Fauzi, S.Ag.',
    className: 'VIII B',
    jenjang: 'SMP',
    subject: 'Pendidikan Agama',
    periodTime: '07:00 - 07:45',
    currentStatus: 'ABSENT_PENDING_CONFIRMATION',
    requestedStatus: 'SICK',
    requesterName: 'Piket 1 (Ahmad Fauzi)',
    reason: 'Surat keterangan sakit dari klinik rawat inap',
    status: 'APPROVED',
    createdAt: 'Kemarin, 08:15 WIB',
    reviewedAt: 'Kemarin, 08:30 WIB',
    reviewedBy: 'Ketua Piket (Drs. H. Ahmad Dahlan)',
    reviewNotes: 'Surat dokter valid & terkonfirmasi wali kelas',
  },
];

export default function KetuaPiketApprovalsPage() {
  const [requests, setRequests] = useState<ChangeRequestItem[]>(sampleRequests);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  // Review Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [targetReq, setTargetReq] = useState<ChangeRequestItem | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('simogu_edit_requests');
      if (stored) {
        const parsed = JSON.parse(stored) as ChangeRequestItem[];
        setRequests((prev) => {
          const combined = [...prev];
          parsed.forEach((p) => {
            const idx = combined.findIndex((c) => c.id === p.id);
            if (idx >= 0) {
              combined[idx] = p;
            } else {
              combined.unshift(p);
            }
          });
          return combined;
        });
      }
    } catch (e) {}
  }, []);

  const filteredRequests = requests
    .filter((r) => (activeTab === 'PENDING' ? r.status === 'PENDING' : r.status !== 'PENDING'))
    .filter((r) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (r.teacherName && r.teacherName.toLowerCase().includes(q)) ||
        (r.className && r.className.toLowerCase().includes(q)) ||
        (r.subject && r.subject.toLowerCase().includes(q)) ||
        (r.requesterName && r.requesterName.toLowerCase().includes(q))
      );
    });

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const historyCount = requests.filter((r) => r.status !== 'PENDING').length;

  const handleOpenReview = (item: ChangeRequestItem, type: 'APPROVE' | 'REJECT') => {
    setTargetReq(item);
    setActionType(type);
    setReviewNotes('');
    setModalOpen(true);
  };

  const handleConfirmReview = () => {
    if (!targetReq) return;

    const isApprove = actionType === 'APPROVE';
    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    const updated = requests.map((r) => {
      if (r.id === targetReq.id) {
        return {
          ...r,
          status: (isApprove ? 'APPROVED' : 'REJECTED') as 'APPROVED' | 'REJECTED',
          reviewedAt: `Hari Ini, ${nowStr}`,
          reviewedBy: 'Ketua Piket (Drs. H. Ahmad Dahlan)',
          reviewNotes: reviewNotes.trim() || (isApprove ? 'Disetujui oleh Ketua Piket' : 'Ditolak oleh Ketua Piket'),
        };
      }
      return r;
    });

    setRequests(updated);

    try {
      localStorage.setItem('simogu_edit_requests', JSON.stringify(updated));
    } catch (e) {}

    setAlertSuccess(
      isApprove
        ? `Permohonan edit presensi untuk ${targetReq.teacherName} BERHASIL DI-ACC!`
        : `Permohonan edit presensi untuk ${targetReq.teacherName} TELAH DITOLAK.`
    );
    setTimeout(() => setAlertSuccess(null), 4000);

    setModalOpen(false);
    setTargetReq(null);
  };

  return (
    <div className="min-h-screen transition-colors duration-500 p-3 sm:p-6 relative">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 relative z-10">

        {/* Header Bar */}
        <header className="p-3.5 sm:p-4 glass-card rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link
              href="/ketua-piket/dashboard"
              className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 tracking-tight truncate">
                ACC Ajuan Edit Presensi
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Wewenang Ketua Piket untuk Menyetujui atau Menolak
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

        {/* Success Alert Toast */}
        {alertSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{alertSuccess}</span>
          </div>
        )}

        {/* Tab Selector & Search Filter */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* 2 Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'PENDING'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>Menunggu ACC</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  pendingCount > 0 ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                }`}>
                  {pendingCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('HISTORY')}
                className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'HISTORY'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>Riwayat ACC</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300">
                  {historyCount}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari guru / kelas / mapel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="glass-card p-10 rounded-2xl text-center space-y-2.5">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {activeTab === 'PENDING'
                  ? 'Tidak Ada Ajuan yang Menunggu ACC'
                  : 'Belum Ada Riwayat Ajuan'}
              </p>
              <p className="text-xs text-slate-500">
                {activeTab === 'PENDING'
                  ? 'Semua permohonan perubahan status absensi telah diproses.'
                  : 'Riwayat persetujuan atau penolakan akan ditampilkan di sini.'}
              </p>
            </div>
          ) : (
            filteredRequests.map((item) => (
              <div
                key={item.id}
                className="glass-card p-4 sm:p-5 rounded-2xl space-y-3.5 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400/50 transition-all"
              >
                {/* Item Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-50">
                      {item.teacherName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                      {item.className} ({item.jenjang || 'SMA'})
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                      {item.subject}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.createdAt}
                    </span>
                    {item.status === 'PENDING' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        Menunggu ACC
                      </span>
                    )}
                    {item.status === 'APPROVED' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        ✓ Disetujui
                      </span>
                    )}
                    {item.status === 'REJECTED' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        ✕ Ditolak
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Transition & Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1.5 bg-slate-50/80 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Perubahan Status Kehadiran:
                    </div>
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
                        {item.currentStatus || 'ABSENT_PENDING_CONFIRMATION'}
                      </span>
                      <span className="text-slate-400 font-bold">➔</span>
                      <span className="px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                        {item.requestedStatus || 'PERMISSION'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Waktu Jam: <span className="font-mono text-slate-700 dark:text-slate-300">{item.periodTime}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 bg-slate-50/80 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Alasan & Pengaju:
                    </div>
                    <div className="text-slate-700 dark:text-slate-200 italic">
                      "{item.reason || 'Tidak ada keterangan tambahan'}"
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Petugas Piket: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.requesterName}</span>
                    </div>
                  </div>
                </div>

                {/* Review Notes (If already reviewed) */}
                {item.reviewedAt && (
                  <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 text-xs space-y-1 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Ditanggapi oleh: <strong className="text-slate-700 dark:text-slate-200">{item.reviewedBy}</strong></span>
                      <span className="font-mono">{item.reviewedAt}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 italic">
                      Catatan Ketua Piket: "{item.reviewNotes}"
                    </p>
                  </div>
                )}

                {/* Action Buttons (Only for PENDING) */}
                {item.status === 'PENDING' && (
                  <div className="flex items-center justify-end gap-2.5 pt-1">
                    <button
                      onClick={() => handleOpenReview(item, 'REJECT')}
                      className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <X className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>

                    <button
                      onClick={() => handleOpenReview(item, 'APPROVE')}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui (ACC)</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>

      {/* Modal Review ACC / Tolak */}
      {modalOpen && targetReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                actionType === 'APPROVE'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-600'
              }`}>
                {actionType === 'APPROVE' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                  {actionType === 'APPROVE' ? 'Konfirmasi ACC Ajuan Edit' : 'Konfirmasi Penolakan Ajuan'}
                </h3>
                <p className="text-xs text-slate-500">
                  Guru: {targetReq.teacherName} ({targetReq.className})
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
              <div>Perubahan Status: <strong>{targetReq.currentStatus} ➔ {targetReq.requestedStatus}</strong></div>
              <div>Alasan Piket: <em className="text-slate-600 dark:text-slate-400">"{targetReq.reason}"</em></div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Catatan Persetujuan Ketua Piket (Opsional):
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  actionType === 'APPROVE'
                    ? 'Contoh: Disetujui, bukti surat tugas sudah diverifikasi.'
                    : 'Contoh: Ditolak, lampiran surat tidak lengkap.'
                }
                className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                onClick={handleConfirmReview}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all ${
                  actionType === 'APPROVE'
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                }`}
              >
                {actionType === 'APPROVE' ? 'Ya, ACC Sekarang' : 'Ya, Tolak Ajuan'}
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
