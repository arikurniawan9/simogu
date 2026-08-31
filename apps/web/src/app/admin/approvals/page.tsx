'use client';

import React, { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { DataTable, Column } from '@/components/data-table';
import { Footer } from '@/components/footer';
import { CheckCircle2, XCircle, Clock, FileText, ArrowLeft, Paperclip } from 'lucide-react';
import Link from 'next/link';
import { LogoutButton } from '@/components/logout-button';

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
}

const sampleRequests: ChangeRequestItem[] = [
  {
    id: 'cr-1',
    teacherName: 'Siti Rahma, S.Pd.',
    className: 'X IPA 1',
    subject: 'Bahasa Indonesia',
    periodTime: '07:45 - 08:30',
    currentStatus: 'ABSENT_PENDING_CONFIRMATION',
    requestedStatus: 'PERMISSION',
    requesterName: 'Piket 1 (Petugas)',
    reason: 'Guru menyerahkan surat dokter & izin rapat MGMP',
    attachmentUrl: 'https://example.com/surat-izin.pdf',
    status: 'PENDING',
    createdAt: '2026-08-09 08:00',
  },
  {
    id: 'cr-2',
    teacherName: 'Ahmad Fauzi, S.Ag.',
    className: 'XII IPA 1',
    subject: 'Pendidikan Agama',
    periodTime: '09:30 - 10:15',
    currentStatus: 'ABSENT_PENDING_CONFIRMATION',
    requestedStatus: 'OFFICIAL_DUTY',
    requesterName: 'Piket 2 (Petugas)',
    reason: 'Tugas mendampingi lomba MTQ tingkat provinsi',
    status: 'PENDING',
    createdAt: '2026-08-09 09:45',
  },
];

export default function AdminApprovalsPage() {
  const [requests, setRequests] = useState<ChangeRequestItem[]>(sampleRequests);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('simogu_edit_requests');
      if (stored) {
        const parsed = JSON.parse(stored) as ChangeRequestItem[];
        // Merge with sample requests, filter out duplicates by id if any
        setRequests(prev => {
          const combined = [...prev];
          parsed.forEach(p => {
            if (!combined.find(c => c.id === p.id)) {
              combined.push(p);
            }
          });
          return combined;
        });
      }
    } catch (e) {}
  }, []);

  // Review Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [targetReq, setTargetReq] = useState<ChangeRequestItem | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reviewNotes, setReviewNotes] = useState('');

  const filteredRequests = requests.filter((r) =>
    activeTab === 'PENDING' ? r.status === 'PENDING' : r.status !== 'PENDING',
  );

  const handleOpenReview = (item: ChangeRequestItem, type: 'APPROVE' | 'REJECT') => {
    setTargetReq(item);
    setActionType(type);
    setReviewNotes('');
    setModalOpen(true);
  };

  const handleConfirmReview = () => {
    if (targetReq) {
      setRequests((prev) => {
        const next = prev.map((r) =>
          r.id === targetReq.id
            ? { ...r, status: (actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED') as 'APPROVED' | 'REJECTED' }
            : r,
        );
        // Save back to localStorage if it was a piket request
        try {
          const stored = localStorage.getItem('simogu_edit_requests');
          if (stored) {
            let parsed = JSON.parse(stored) as ChangeRequestItem[];
            parsed = parsed.map((r) => 
              r.id === targetReq.id 
                ? { ...r, status: (actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED') as 'APPROVED' | 'REJECTED' } 
                : r
            );
            localStorage.setItem('simogu_edit_requests', JSON.stringify(parsed));
          }
        } catch(e) {}
        return next;
      });
    }
    setModalOpen(false);
  };

  const columns: Column<ChangeRequestItem>[] = [
    {
      key: 'teacherName',
      header: 'Guru & Kelas',
      render: (item) => (
        <div>
          {item.teacherName ? (
            <>
              <div className="font-bold text-slate-900 dark:text-slate-100">{item.teacherName}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {item.className} • {item.subject} ({item.periodTime})
              </div>
            </>
          ) : (
            <>
              <div className="font-bold text-slate-900 dark:text-slate-100">Revisi Absensi Kelas {item.className}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Jenjang: {item.jenjang || '-'}
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'statusChange',
      header: 'Keterangan',
      render: (item) => (
        item.requestedStatus ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              Pending
            </span>
            <span>➔</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {item.requestedStatus}
            </span>
          </div>
        ) : (
          <div className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 inline-block">
            Pengajuan Perubahan Kolektif
          </div>
        )
      ),
    },
    {
      key: 'reason',
      header: 'Alasan & Pengaju',
      render: (item) => (
        <div>
          <div className="text-xs font-medium text-slate-800 dark:text-slate-200">{item.reason || 'Penyesuaian oleh Guru Piket'}</div>
          <div className="text-[11px] text-slate-400 font-mono">Oleh: {item.requesterName}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi Approval',
      render: (item) =>
        item.status === 'PENDING' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenReview(item, 'APPROVE')}
              className="px-3 py-1.5 rounded-md text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Setujui
            </button>
            <button
              onClick={() => handleOpenReview(item, 'REJECT')}
              className="px-3 py-1.5 rounded-md text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" /> Tolak
            </button>
          </div>
        ) : (
          <span
            className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
              item.status === 'APPROVED'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}
          >
            {item.status}
          </span>
        ),
    },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 p-4 sm:p-6 relative">
      {/* Floating Animated Ambient Blobs */}
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">

        {/* Header Bar */}
        <header className="flex items-center justify-between p-4 glass-card rounded-lg">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                Persetujuan Perubahan Status Absensi
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Persetujuan transaksional persetujuan atau penolakan pengajuan perubahan status
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
              <LogoutButton size="sm" />
          </div>
        </header>

        {/* Tabs Bar */}
        <div className="glass-card p-2 rounded-lg flex items-center gap-2">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'PENDING'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" /> Menunggu Persetujuan ({requests.filter((r) => r.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'HISTORY'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Riwayat Persetujuan
          </button>
        </div>

        {/* Data Table */}
        <div className="glass-card p-5 sm:p-6 rounded-lg space-y-4">
          <DataTable
            data={filteredRequests}
            columns={columns}
            searchPlaceholder="Cari nama guru, kelas, alasan, atau pengaju..."
            pageSizeOptions={[5, 10, 20]}
          />
        </div>

        {/* Global Footer */}
        <Footer />

      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmReview}
        title={actionType === 'APPROVE' ? 'Setujui Perubahan Status' : 'Tolak Perubahan Status'}
        description={`Apakah Anda yakin ingin ${actionType === 'APPROVE' ? 'MENYETUJUI' : 'MENOLAK'} pengajuan perubahan status untuk ${targetReq?.teacherName}?`}
        variant={actionType === 'APPROVE' ? 'success' : 'danger'}
        confirmText={actionType === 'APPROVE' ? 'Ya, Setujui' : 'Ya, Tolak'}
      />
    </div>
  );
}
