'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  Users,
  Stethoscope,
  Briefcase,
  AlertCircle,
  ChevronDown,
  XCircle,
} from 'lucide-react';

export type AttendanceStatus = 'HADIR' | 'IZIN' | 'SAKIT' | 'TANPA_KETERANGAN' | 'TUGAS_DINAS' | 'PENDING';

interface AttendanceActionDropdownProps {
  onSelect: (status: AttendanceStatus) => void;
  currentStatus?: string;
  disabled?: boolean;
}

const ACTIONS: {
  status: AttendanceStatus;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  dot: string;
}[] = [
  {
    status: 'HADIR',
    label: 'Hadir',
    icon: CheckCircle2,
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40',
    border: 'border-emerald-100 dark:border-emerald-900',
    dot: 'bg-emerald-500',
  },
  {
    status: 'IZIN',
    label: 'Izin',
    icon: Users,
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'hover:bg-amber-50 dark:hover:bg-amber-950/40',
    border: 'border-amber-100 dark:border-amber-900',
    dot: 'bg-amber-500',
  },
  {
    status: 'SAKIT',
    label: 'Sakit',
    icon: Stethoscope,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'hover:bg-slate-100 dark:hover:bg-slate-800',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  {
    status: 'TANPA_KETERANGAN',
    label: 'Tanpa Keterangan',
    icon: XCircle,
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'hover:bg-rose-50 dark:hover:bg-rose-950/40',
    border: 'border-rose-100 dark:border-rose-900',
    dot: 'bg-rose-500',
  },
  {
    status: 'TUGAS_DINAS',
    label: 'Tugas Dinas',
    icon: Briefcase,
    color: 'text-sky-700 dark:text-sky-300',
    bg: 'hover:bg-sky-50 dark:hover:bg-sky-950/40',
    border: 'border-sky-100 dark:border-sky-900',
    dot: 'bg-sky-500',
  },
  {
    status: 'PENDING',
    label: 'Pending',
    icon: AlertCircle,
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'hover:bg-purple-50 dark:hover:bg-purple-950/40',
    border: 'border-purple-100 dark:border-purple-900',
    dot: 'bg-purple-500',
  },
];

export function AttendanceActionDropdown({
  onSelect,
  currentStatus = 'PENDING',
  disabled = false,
}: AttendanceActionDropdownProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, openUp: false });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = 260;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight && rect.top > menuHeight;

    setPosition({
      top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: Math.min(rect.left, window.innerWidth - 200),
      openUp,
    });
  }, []);

  const handleOpen = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    updatePosition();
    setOpen((prev) => !prev);
  };

  // Close on outside click / scroll / resize
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  const handleSelect = (status: AttendanceStatus) => {
    setOpen(false);
    onSelect(status);
  };

  const current = ACTIONS.find((a) => a.status === currentStatus);

  const dropdown = open && (
    <div
      ref={menuRef}
      style={{ top: position.top, left: position.left, position: 'fixed', zIndex: 9998 }}
      className="w-48 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Atur Status Absensi
        </p>
      </div>

      {/* Options */}
      <div className="p-1">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const isActive = currentStatus === action.status;
          return (
            <button
              key={action.status}
              onClick={() => handleSelect(action.status)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-100 group
                ${action.bg} ${action.color}
                ${isActive ? 'ring-1 ring-inset ring-current opacity-90' : ''}
              `}
            >
              <span className={`w-2 h-2 rounded-full ${action.dot} shrink-0`} />
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 text-left">{action.label}</span>
              {isActive && (
                <span className="text-[10px] font-bold opacity-60 shrink-0">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleOpen}
        disabled={disabled}
        title="Atur status absensi"
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150
          ${disabled ? 'opacity-50 cursor-not-allowed grayscale bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200' :
          open
            ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-200'
          }`}
      >
        {current ? (
          <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} />
        ) : null}
        <span className="hidden sm:inline">Aksi</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {typeof window !== 'undefined' && createPortal(dropdown, document.body)}
    </>
  );
}
