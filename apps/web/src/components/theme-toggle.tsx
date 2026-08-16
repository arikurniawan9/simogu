'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-md bg-slate-200 dark:bg-surface-cardDark animate-pulse" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative p-2 rounded-md bg-brand-50 hover:bg-brand-100 dark:bg-surface-cardDark dark:hover:bg-brand-900/40 text-brand-600 dark:text-brand-300 transition-all duration-200 border border-brand-200/50 dark:border-surface-borderDark shadow-sm hover:scale-105"
      title="Ganti Mode Terang / Gelap"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 transition-transform duration-500 rotate-0 hover:rotate-90 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-500 rotate-0 hover:-rotate-12 text-brand-700" />
      )}
    </button>
  );
}
