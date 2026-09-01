'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  UserCheck,
  Calendar,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Search,
  LogIn,
  ClipboardCheck,
  Crown,
  Moon,
  Sun,
  Shield,
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('simogu_token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('simogu_user') : null;

    if (token) {
      setIsLoggedIn(true);
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          setUserRole(u.role || 'ADMIN');
          setUserName(u.name || u.fullName || 'User');
        } catch {
          setUserRole('ADMIN');
        }
      } else {
        setUserRole('ADMIN');
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }

    // Check pending approvals count for badge
    try {
      const editReqs = localStorage.getItem('simogu_edit_requests');
      if (editReqs) {
        const parsed = JSON.parse(editReqs);
        const count = parsed.filter((r: any) => r.status === 'PENDING').length;
        setPendingApprovalsCount(count || 2); // Default sample count
      } else {
        setPendingApprovalsCount(2);
      }
    } catch {
      setPendingApprovalsCount(2);
    }
  }, [pathname]);

  // Close drawer on route change
  useEffect(() => {
    setMenuDrawerOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('simogu_token');
      localStorage.removeItem('simogu_user');
      document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
    }
    setIsLoggedIn(false);
    setUserRole(null);
    setMenuDrawerOpen(false);
    router.push('/login');
  };

  // Determine Nav Items based on Role / Public View
  const getNavItems = (): NavItem[] => {
    if (!isLoggedIn) {
      return [
        { label: 'Beranda', href: '/', icon: Home },
        { label: 'Cari Guru', href: '/guru', icon: Search },
        { label: 'Masuk', href: '/login', icon: LogIn },
      ];
    }

    const role = (userRole || '').toUpperCase();

    if (role === 'KETUA_PIKET') {
      return [
        { label: 'Dashboard', href: '/ketua-piket/dashboard', icon: Home },
        { label: 'Pantau Kelas', href: '/ketua-piket/attendance', icon: ClipboardCheck },
        { label: 'ACC Edit', href: '/ketua-piket/approvals', icon: CheckCircle2, badge: pendingApprovalsCount },
        { label: 'Rekap Guru', href: '/ketua-piket/reports', icon: FileSpreadsheet },
        { label: 'Profil', href: '/settings/profile', icon: User },
      ];
    }

    if (role === 'PIKET') {
      return [
        { label: 'Dashboard', href: '/piket/dashboard', icon: Home },
        { label: 'Absensi', href: '/piket/attendance', icon: ClipboardCheck },
        { label: 'Cari Guru', href: '/guru', icon: Search },
        { label: 'Profil', href: '/settings/profile', icon: User },
      ];
    }

    if (role === 'SUPERADMIN' || role === 'SUPER_ADMIN') {
      return [
        { label: 'Dashboard', href: '/superadmin/dashboard', icon: Crown },
        { label: 'Guru', href: '/admin/teachers', icon: UserCheck },
        { label: 'Jadwal', href: '/admin/schedules', icon: Calendar },
        { label: 'Laporan', href: '/admin/reports', icon: FileSpreadsheet },
        { label: 'Profil', href: '/settings/profile', icon: User },
      ];
    }

    // Default: ADMIN
    return [
      { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
      { label: 'Guru', href: '/admin/teachers', icon: UserCheck },
      { label: 'Jadwal', href: '/admin/schedules', icon: Calendar },
      { label: 'Kelas', href: '/admin/classes', icon: Building2 },
      { label: 'Laporan', href: '/admin/reports', icon: FileSpreadsheet },
    ];
  };

  const navItems = getNavItems();

  const isCurrentActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Pinned Bottom Glass Navbar (Visible only on Mobile md:hidden) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden print:hidden border-t border-brand-200/50 dark:border-surface-borderDark bg-white/95 dark:bg-surface-cardDark/95 backdrop-blur-xl shadow-[0_-8px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_25px_rgba(0,0,0,0.4)] transition-all duration-300"
      >
        <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                  active
                    ? 'text-brand-600 dark:text-brand-400 font-black scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
                }`}
              >
                {/* Active Pill Glow Indicator */}
                {active && (
                  <span className="absolute -top-1 w-8 h-1 rounded-full bg-brand-500 shadow-sm shadow-brand-500/50 animate-in fade-in zoom-in-75 duration-300" />
                )}

                <div className={`p-1 rounded-lg ${active ? 'bg-brand-50 dark:bg-brand-950/60' : ''}`}>
                  <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
                </div>

                <span className="text-[10px] tracking-tight truncate max-w-[60px]">
                  {item.label}
                </span>

                {item.badge !== undefined && (
                  <span className="absolute top-0 right-1 px-1.5 py-0.2 text-[9px] font-black rounded-full bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* More Menu Drawer Trigger Button for Admin/Logged in */}
          {isLoggedIn && (
            <button
              onClick={() => setMenuDrawerOpen(true)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium ${
                menuDrawerOpen ? 'text-brand-600 dark:text-brand-400 font-black' : ''
              }`}
            >
              <div className="p-1 rounded-lg">
                <Menu className="w-5 h-5 stroke-2" />
              </div>
              <span className="text-[10px] tracking-tight">Menu</span>

              {pendingApprovalsCount > 0 && userRole !== 'PIKET' && (
                <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Slide-Up Mobile Navigation Drawer */}
      {menuDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
          {/* Backdrop */}
          <div
            onClick={() => setMenuDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          />

          {/* Bottom Sheet Drawer */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto p-5 space-y-5 animate-in slide-in-from-bottom duration-300">
            {/* Drawer Header with Handle */}
            <div className="space-y-3 text-center">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/25">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">
                      Menu Navigasi SIMOGU
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {userName} ({userRole})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setMenuDrawerOpen(false)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Links Grid in Drawer */}
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href={userRole === 'KETUA_PIKET' ? '/ketua-piket/dashboard' : '/admin/dashboard'}
                onClick={() => setMenuDrawerOpen(false)}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 hover:border-brand-500 flex items-center gap-3 transition-all"
              >
                <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Dashboard</div>
                  <div className="text-[10px] text-slate-500">{userRole === 'KETUA_PIKET' ? 'Ketua Piket' : 'Beranda Admin'}</div>
                </div>
              </Link>

              <Link
                href={userRole === 'KETUA_PIKET' ? '/ketua-piket/approvals' : '/admin/approvals'}
                onClick={() => setMenuDrawerOpen(false)}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 hover:border-purple-500 flex items-center gap-3 transition-all relative"
              >
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{userRole === 'KETUA_PIKET' ? 'ACC Ajuan Edit' : 'Persetujuan'}</div>
                  <div className="text-[10px] text-slate-500">Approval Absensi</div>
                </div>
                {pendingApprovalsCount > 0 && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-purple-600 text-white">
                    {pendingApprovalsCount}
                  </span>
                )}
              </Link>

              <Link
                href={userRole === 'KETUA_PIKET' ? '/ketua-piket/reports' : '/admin/reports'}
                onClick={() => setMenuDrawerOpen(false)}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 hover:border-cyan-500 flex items-center gap-3 transition-all"
              >
                <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{userRole === 'KETUA_PIKET' ? 'Rekap Laporan' : 'Laporan Presensi'}</div>
                  <div className="text-[10px] text-slate-500">Harian/Minggu/Bulan</div>
                </div>
              </Link>

              <Link
                href={userRole === 'KETUA_PIKET' ? '/ketua-piket/attendance' : '/admin/teachers'}
                onClick={() => setMenuDrawerOpen(false)}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 hover:border-emerald-500 flex items-center gap-3 transition-all"
              >
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  {userRole === 'KETUA_PIKET' ? <ClipboardCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {userRole === 'KETUA_PIKET' ? 'Pantau & Absen' : 'Master Guru'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {userRole === 'KETUA_PIKET' ? 'Kontrol Kelas Real-Time' : 'Data Pengajar'}
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/classes"
                onClick={() => setMenuDrawerOpen(false)}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 hover:border-amber-500 flex items-center gap-3 transition-all"
              >
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Master Kelas</div>
                  <div className="text-[10px] text-slate-500">SMP / SMA / SMK</div>
                </div>
              </Link>

              <Link
                href="/admin/schedules"
                onClick={() => setMenuDrawerOpen(false)}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 hover:border-blue-500 flex items-center gap-3 transition-all"
              >
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Jadwal Mapel</div>
                  <div className="text-[10px] text-slate-500">Jam Mengajar</div>
                </div>
              </Link>

              <Link
                href="/admin/reports"
                onClick={() => setMenuDrawerOpen(false)}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 hover:border-cyan-500 flex items-center gap-3 transition-all"
              >
                <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Laporan Presensi</div>
                  <div className="text-[10px] text-slate-500">Ekspor & Cetak</div>
                </div>
              </Link>

              <Link
                href="/admin/whatsapp"
                onClick={() => setMenuDrawerOpen(false)}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 hover:border-green-500 flex items-center gap-3 transition-all"
              >
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">WhatsApp API</div>
                  <div className="text-[10px] text-slate-500">Log Outbox Meta</div>
                </div>
              </Link>

              <Link
                href="/guru"
                onClick={() => setMenuDrawerOpen(false)}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 hover:border-brand-500 flex items-center gap-3 transition-all"
              >
                <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Portal Publik</div>
                  <div className="text-[10px] text-slate-500">Cari Jadwal Guru</div>
                </div>
              </Link>
            </div>

            {/* Utility Quick Bar: Theme Toggle & Profile */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-brand-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <span>Mode Tampilan</span>
                </div>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm"
                >
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>

              <Link
                href="/settings/profile"
                onClick={() => setMenuDrawerOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900 text-xs font-bold flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Kelola Akun & Keamanan
              </Link>

              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Keluar dari Akun (Logout)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
