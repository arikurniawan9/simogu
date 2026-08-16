'use client';

import React from 'react';
import { Instagram, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full mt-6 relative z-10 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="glass-card px-3.5 py-2.5 rounded-lg border-l-4 border-l-brand-600 shadow-md shadow-brand-500/5 flex items-center justify-between gap-3 text-left">
          {/* Left Branding & Title */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate">
              <span className="font-extrabold text-slate-900 dark:text-slate-100">
                SIMOGU
              </span>{' '}
              Pondok Pesantren Al Ittihad
            </div>
          </div>

          {/* Right Author & Instagram Icon Button */}
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400 shrink-0">
            <span>by AK</span>
            <a
              href="https://instagram.com/kurniawan_arind"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-slate-200 dark:border-slate-700 transition-all group"
              title="Instagram"
            >
              <Instagram className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
