'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

export type ModalVariant = 'warning' | 'danger' | 'success' | 'info';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'warning',
  isLoading = false,
}: ConfirmationModalProps) {
  // Tutup dengan Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Cegah scroll background saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const iconMap = {
    warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    danger:  <XCircle className="w-6 h-6 text-rose-500" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
    info:    <Info className="w-6 h-6 text-sky-500" />,
  };

  const iconBgMap = {
    warning: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    danger:  'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    success: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    info:    'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800',
  };

  const accentMap = {
    warning: 'bg-amber-400/15 dark:bg-amber-500/10',
    danger:  'bg-rose-400/15 dark:bg-rose-500/10',
    success: 'bg-emerald-400/15 dark:bg-emerald-500/10',
    info:    'bg-sky-400/15 dark:bg-sky-500/10',
  };

  const buttonBgMap = {
    warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/25',
    danger:  'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/25',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25',
    info:    'bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-500/25',
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        // z-[9999] memastikan modal selalu di atas segalanya
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">

          {/* Backdrop — blur kuat + gelap */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={!isLoading ? onClose : undefined}
            className="absolute inset-0 bg-slate-900/70 dark:bg-black/85 backdrop-blur-md cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Accent blob */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none ${accentMap[variant]}`} />

            {/* Header: Icon + Close */}
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-lg border ${iconBgMap[variant]}`}>
                {iconMap[variant]}
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <h3 id="modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {description}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all duration-150 disabled:opacity-40"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-150 hover:scale-[1.03] active:scale-95 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${buttonBgMap[variant]}`}
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Render ke document.body agar tidak terhalang oleh stacking context apapun
  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
