'use client';

import React, { useState } from 'react';
import { Bell, Check, CheckCheck, FileText, MessageSquare, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  deepLink?: string;
}

const sampleNotifs: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Pengajuan Perubahan Baru',
    message: 'Piket 1 mengajukan izin untuk Siti Rahma, S.Pd. (X IPA 1)',
    type: 'CHANGE_REQUEST',
    isRead: false,
    createdAt: '5 menit lalu',
    deepLink: '/admin/approvals',
  },
  {
    id: 'n-2',
    title: 'Outbox WhatsApp Gagal',
    message: 'Pesan ke Budi Santoso, S.T. gagal terhubung',
    type: 'WHATSAPP',
    isRead: false,
    createdAt: '1 jam lalu',
    deepLink: '/admin/whatsapp',
  },
];

export function NotificationBell() {
  const [notifs, setNotifs] = useState<NotificationItem[]>(sampleNotifs);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markOneAsRead = (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        aria-label="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-surface-cardDark border border-slate-200 dark:border-surface-borderDark rounded-lg shadow-2xl z-50 overflow-hidden space-y-2 p-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 px-1">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              Notifikasi Sistem {unreadCount > 0 && `(${unreadCount} baru)`}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1.5">
            {notifs.map((n) => (
              <div
                key={n.id}
                onClick={() => markOneAsRead(n.id)}
                className={`p-2.5 rounded-md text-xs transition-colors flex items-start gap-2.5 cursor-pointer ${
                  !n.isRead
                    ? 'bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/50 dark:border-brand-900'
                    : 'bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100'
                }`}
              >
                <div className="p-1.5 rounded bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-300 shrink-0 mt-0.5">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{n.title}</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">{n.message}</div>
                  <div className="text-[10px] text-slate-400 font-mono pt-1">{n.createdAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
