'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Footer } from '@/components/footer';
import { LogoutButton } from '@/components/logout-button';
import {
  User,
  Lock,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Camera,
  Shield,
  KeyRound
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  
  // Profile State
  const [user, setUser] = useState<{ name: string; role: string; username: string; id?: string }>({
    name: 'Pengguna',
    role: 'UNKNOWN',
    username: 'user',
  });
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  
  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('simogu_user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
        setName(parsed.name || '');
        setUsername(parsed.username || '');
      }
    } catch(e) {}
  }, []);

  const getDashboardRoute = () => {
    const role = user.role.toLowerCase();
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'superadmin' || role === 'super_admin') return '/superadmin/dashboard';
    if (role === 'ketua_piket' || role === 'ketuapiket') return '/ketua-piket/dashboard';
    if (role === 'piket') return '/piket/dashboard';
    if (role === 'guru') return '/guru/dashboard';
    return '/'; // fallback
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);
    
    // Simulasi API Call
    setTimeout(() => {
      const updatedUser = { ...user, name, username };
      localStorage.setItem('simogu_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsSavingProfile(false);
      setProfileMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      setTimeout(() => setProfileMessage(null), 3000);
    }, 1000);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      setIsSavingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password baru minimal 6 karakter.' });
      setIsSavingPassword(false);
      return;
    }

    // Simulasi API Call
    setTimeout(() => {
      setIsSavingPassword(false);
      setPasswordMessage({ type: 'success', text: 'Password berhasil diubah!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(null), 3000);
    }, 1000);
  };

  const roleLabel = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN': return 'Administrator';
      case 'SUPERADMIN':
      case 'SUPER_ADMIN': return 'Super Administrator';
      case 'KETUA_PIKET': return 'Ketua Petugas Piket';
      case 'PIKET': return 'Guru Piket';
      case 'GURU': return 'Guru / Pengajar';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'SUPERADMIN':
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'KETUA_PIKET': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'PIKET': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-500 p-3 sm:p-6 relative">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 relative z-10">
        
        {/* Header Bar */}
        <header className="p-3.5 sm:p-4 glass-card rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link
              href={getDashboardRoute()}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-9 sm:w-10 h-9 sm:h-10 shrink-0 rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight truncate">
                Pengaturan Akun
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Profil & Keamanan Akun
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <LogoutButton size="sm" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Sidebar / Info Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card p-5 sm:p-6 rounded-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-br from-brand-500 to-brand-700 opacity-20 dark:opacity-40"></div>
              
              <div className="relative mx-auto w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center mt-2 mb-3 group cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white mb-1" />
                  <span className="text-[10px] text-white font-semibold">Ubah</span>
                </div>
                <span className="text-2xl sm:text-3xl font-black text-slate-300 dark:text-slate-600 select-none">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate px-2">{user?.name || 'Pengguna'}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 truncate px-2">@{user?.username || 'user'}</p>
              
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeColor(user.role)}`}>
                <Shield className="w-3.5 h-3.5" />
                {roleLabel(user.role)}
              </div>
            </div>

            <div className="glass-card p-4 sm:p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-1.5 text-slate-800 dark:text-slate-200">
                <KeyRound className="w-4 h-4 text-brand-500" />
                <h3 className="text-xs sm:text-sm font-bold">Keamanan Akun</h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Gunakan kombinasi password yang kuat untuk menjaga keamanan akses presensi sekolah.
              </p>
            </div>
          </div>

          {/* Forms Panel */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            
            {/* Update Profile Form */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl relative overflow-hidden space-y-4">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-500 rounded-l-2xl"></div>
              
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold">
                <User className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-base">Informasi Profil</h3>
              </div>

              {profileMessage && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900' : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900'}`}>
                  {profileMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {profileMessage.text}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Username (ID Login)</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="Masukkan username"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Peran Akses (Role)</label>
                  <input
                    type="text"
                    disabled
                    value={roleLabel(user.role)}
                    className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
                  >
                    {isSavingProfile ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSavingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                  </button>
                </div>
              </form>
            </div>

            {/* Update Password Form */}
            <div className="glass-card p-4 sm:p-6 rounded-2xl relative overflow-hidden space-y-4">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 rounded-l-2xl"></div>
              
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold">
                <Lock className="w-5 h-5 text-amber-500" />
                <h3 className="text-base">Ubah Password</h3>
              </div>

              {passwordMessage && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900' : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900'}`}>
                  {passwordMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {passwordMessage.text}
                </div>
              )}

              <form onSubmit={handleSavePassword} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Password Saat Ini</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Password Baru</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      placeholder="Minimal 6 karakter"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Konfirmasi Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      placeholder="Ulangi password baru"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSavingPassword || !oldPassword || !newPassword || !confirmPassword}
                    className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSavingPassword ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSavingPassword ? 'Menyimpan...' : 'Perbarui Password'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <Footer />
      </div>
    </div>
  );
}
