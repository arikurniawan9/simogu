'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { Shield, Lock, User, ArrowRight, CheckCircle2, KeyRound, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto redirect if already logged in
  React.useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('simogu_token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('simogu_user') : null;

    if (token) {
      let target = '/admin/dashboard';
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'SUPER_ADMIN') {
            target = '/superadmin/dashboard';
          } else if (user.role === 'PIKET') {
            target = '/piket/dashboard';
          } else {
            target = '/admin/dashboard';
          }
        } catch {
          // fallback
        }
      }
      router.replace(target);
    }
  }, [router]);

  // Modal & Redirect State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalVariant, setModalVariant] = useState<'warning' | 'danger' | 'success' | 'info'>('info');
  const [targetUrl, setTargetUrl] = useState<string | null>(null);

  const handleModalConfirm = () => {
    setModalOpen(false);
    if (targetUrl) {
      router.push(targetUrl);
    }
  };

  const fillQuickAccount = (uname: string) => {
    setUsernameOrEmail(uname);
    setPassword('password123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      setModalTitle('Input Tidak Lengkap');
      setModalDesc('Harap isi username/email dan password Anda terlebih dahulu.');
      setModalVariant('warning');
      setModalOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('simogu_token', data.data.accessToken);
          localStorage.setItem('simogu_user', JSON.stringify(data.data.user));
          document.cookie = `access_token=${data.data.accessToken}; path=/; max-age=86400; SameSite=Lax`;
        }

        const role = data.data.user.role;
        const target = role === 'SUPER_ADMIN'
          ? '/superadmin/dashboard'
          : role === 'PIKET'
          ? '/piket/dashboard'
          : '/admin/dashboard';

        setTargetUrl(target);
        setModalTitle('Login Berhasil');
        setModalDesc(`Selamat datang kembali, ${data.data.user.fullName} (${role})! Mengalihkan ke halaman utama...`);
        setModalVariant('success');
        setModalOpen(true);

        setTimeout(() => {
          router.push(target);
        }, 1200);
      } else {
        setModalTitle('Login Gagal');
        setModalDesc(data.error?.message || 'Username atau password yang Anda masukkan salah.');
        setModalVariant('danger');
        setModalOpen(true);
      }
    } catch (err) {
      setModalTitle('Gagal Terhubung');
      setModalDesc('Terjadi kesalahan jaringan saat menghubungkan ke server SIMOGU API.');
      setModalVariant('danger');
      setModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-500 p-4 flex items-center justify-center relative">
      {/* Floating Animated Ambient Blobs */}
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      <div className="w-full max-w-md space-y-4 sm:space-y-5 relative z-10">

        {/* Top Header Card */}
        <header className="flex items-center justify-between p-3.5 sm:p-4 glass-card rounded-2xl">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-lg font-black text-slate-900 dark:text-slate-50 tracking-tight">
              SIMOGU
            </span>
          </div>
          <ThemeToggle />
        </header>

        {/* Main Login Form Card */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl sm:rounded-3xl space-y-5 shadow-2xl">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              Masuk Akun Pengguna
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sistem Monitoring Kehadiran Guru Terpadu
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                Username / Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-600 dark:text-brand-400 pointer-events-none" />
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="admin / piket1 / superadmin"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-600 dark:text-brand-400 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white shadow-lg shadow-brand-600/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memverifikasi Akun...
                </>
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Click Demo Account Buttons for Mobile ease */}
          <div className="p-3.5 bg-brand-50/80 dark:bg-brand-950/40 rounded-xl border border-brand-200/70 dark:border-brand-900 space-y-2">
            <div className="text-xs font-bold text-brand-800 dark:text-brand-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                1-Klik Akun Bawaan (Demo):
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Ketuk untuk isi</span>
            </div>
            
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => fillQuickAccount('admin')}
                className="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-[11px] font-bold shadow-xs active:scale-95 transition-all"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('piket1')}
                className="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-[11px] font-bold shadow-xs active:scale-95 transition-all"
              >
                Piket 1
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('superadmin')}
                className="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-[11px] font-bold shadow-xs active:scale-95 transition-all"
              >
                SuperAdmin
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={handleModalConfirm}
        onConfirm={handleModalConfirm}
        title={modalTitle}
        description={modalDesc}
        variant={modalVariant}
        confirmText={targetUrl ? 'Masuk Sekarang' : 'Tutup'}
      />
    </div>
  );
}
