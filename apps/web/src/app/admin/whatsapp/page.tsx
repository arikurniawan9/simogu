'use client';

import React, { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { DataTable, Column } from '@/components/data-table';
import { MessageSquare, RefreshCw, ArrowLeft, Phone, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { LogoutButton } from '@/components/logout-button';

interface WhatsAppLogItem {
  id: string;
  teacherName: string;
  recipientPhone: string;
  messageBody: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  failureReason?: string;
  sentAt: string;
}

const sampleLogs: WhatsAppLogItem[] = [
  { id: 'wa-1', teacherName: 'Drs. Ari Kurniawan, M.Pd.', recipientPhone: '6281234567801', messageBody: 'Pemberitahuan: Status mengajar Anda di kelas X IPA 1 Jam ke-1 telah dicatat: HADIR', status: 'SENT', sentAt: '2026-08-09 07:05' },
  { id: 'wa-2', teacherName: 'Siti Rahma, S.Pd.', recipientPhone: '6281234567802', messageBody: 'Pemberitahuan: Status mengajar Anda di kelas X IPA 1 Jam ke-2 telah dicatat: PENDING KONFIRMASI', status: 'SENT', sentAt: '2026-08-09 07:50' },
  { id: 'wa-3', teacherName: 'Budi Santoso, S.T.', recipientPhone: '6281234567803', messageBody: 'Pemberitahuan: Anda belum tercatat di kelas X IPA 2 Jam ke-1', status: 'FAILED', failureReason: 'Nomor tidak terhubung ke WhatsApp', sentAt: '2026-08-09 07:10' },
];

export default function AdminWhatsAppLogsPage() {
  const [logs, setLogs] = useState<WhatsAppLogItem[]>(sampleLogs);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [targetLog, setTargetLog] = useState<WhatsAppLogItem | null>(null);

  const handleOpenResend = (item: WhatsAppLogItem) => {
    setTargetLog(item);
    setModalOpen(true);
  };

  const handleConfirmResend = () => {
    if (targetLog) {
      setLogs((prev) =>
        prev.map((l) =>
          l.id === targetLog.id ? { ...l, status: 'SENT', failureReason: undefined } : l,
        ),
      );
    }
    setModalOpen(false);
  };

  const columns: Column<WhatsAppLogItem>[] = [
    {
      key: 'teacherName',
      header: 'Tujuan Guru',
      render: (item) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{item.teacherName}</div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Phone className="w-3 h-3 text-emerald-600" /> {item.recipientPhone}
          </div>
        </div>
      ),
    },
    {
      key: 'messageBody',
      header: 'Isi Pesan Notification',
      render: (item) => (
        <div>
          <div className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2">{item.messageBody}</div>
          {item.failureReason && (
            <div className="text-[11px] font-medium text-rose-600 dark:text-rose-400 mt-0.5">
              Alasan Gagal: {item.failureReason}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status Send',
      render: (item) => {
        const badges: Record<string, { label: string; cls: string }> = {
          SENT: { label: 'Terkirim', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
          FAILED: { label: 'Gagal', cls: 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
          PENDING: { label: 'Mengantri', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
        };
        const b = badges[item.status] || badges.PENDING;

        return (
          <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${b.cls}`}>
            {b.label}
          </span>
        );
      },
    },
    {
      key: 'sentAt',
      header: 'Waktu',
      render: (item) => <span className="font-mono text-xs text-slate-500">{item.sentAt}</span>,
    },
    {
      key: 'actions',
      header: 'Aksi Retry',
      render: (item) =>
        item.status === 'FAILED' ? (
          <button
            onClick={() => handleOpenResend(item)}
            className="px-3 py-1.5 rounded-md text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Kirim Ulang
          </button>
        ) : (
          <span className="text-xs text-slate-400">-</span>
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
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                Log Outbox WhatsApp
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencatatan outbox non-blocking dan mekanisme resend retry pesan notifikasi WhatsApp
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
              <LogoutButton size="sm" />
          </div>
        </header>

        {/* Data Table */}
        <div className="glass-card p-5 sm:p-6 rounded-lg space-y-4">
          <DataTable
            data={logs}
            columns={columns}
            searchPlaceholder="Cari nama guru, nomor telepon, atau isi pesan..."
            pageSizeOptions={[5, 10, 20]}
          />
        </div>

      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmResend}
        title="Kirim Ulang Pesan WhatsApp"
        description={`Apakah Anda yakin ingin mencoba mengirim ulang pesan WhatsApp ke ${targetLog?.teacherName} (${targetLog?.recipientPhone})?`}
        variant="warning"
        confirmText="Kirim Ulang Sekarang"
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
