'use client';

import React from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Footer } from '@/components/footer';
import {
  Calendar,
  UserCheck,
  Building2,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Shield,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { LogoutButton } from '@/components/logout-button';

interface CompactMetroTile {
  id: string;
  title: string;
  metric: string;
  subtitle: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accentGradient: string;
  iconBg: string;
  iconColor: string;
}

const compactTiles: CompactMetroTile[] = [
  {
    id: 'schedules',
    title: 'Jadwal Mengajar',
    metric: '48 Jam',
    subtitle: '12 Rombel (SMP/SMA/SMK)',
    href: '/admin/schedules',
    icon: Calendar,
    accentGradient: 'border-l-blue-500 hover:border-l-blue-600',
    iconBg: 'bg-blue-100 dark:bg-blue-950/80',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'teachers',
    title: 'Master Data Guru',
    metric: '36 Guru',
    subtitle: 'Multi-Jenjang & Mapel',
    href: '/admin/teachers',
    icon: UserCheck,
    accentGradient: 'border-l-emerald-500 hover:border-l-emerald-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/80',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'classes',
    title: 'Master Data Kelas',
    metric: '18 Kelas',
    subtitle: '18 Wali Kelas',
    href: '/admin/classes',
    icon: Building2,
    accentGradient: 'border-l-amber-500 hover:border-l-amber-600',
    iconBg: 'bg-amber-100 dark:bg-amber-950/80',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'approvals',
    title: 'Persetujuan Approval',
    metric: '3 Pending',
    subtitle: 'Butuh Tindakan Admin',
    href: '/admin/approvals',
    icon: CheckCircle2,
    accentGradient: 'border-l-purple-500 hover:border-l-purple-600',
    iconBg: 'bg-purple-100 dark:bg-purple-950/80',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'reports',
    title: 'Laporan Presensi',
    metric: '98.4%',
    subtitle: 'Tingkat Kehadiran Guru',
    href: '/admin/reports',
    icon: TrendingUp,
    accentGradient: 'border-l-cyan-500 hover:border-l-cyan-600',
    iconBg: 'bg-cyan-100 dark:bg-cyan-950/80',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Official API',
    metric: 'Terhubung',
    subtitle: 'Meta Cloud API',
    href: '/admin/whatsapp',
    icon: MessageSquare,
    accentGradient: 'border-l-green-500 hover:border-l-green-600',
    iconBg: 'bg-green-100 dark:bg-green-950/80',
    iconColor: 'text-green-600 dark:text-green-400',
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen transition-colors duration-500 p-3 sm:p-6 relative">
      {/* Floating Ambient Blobs */}
      <div className="ambient-blob-1" />
      <div className="ambient-blob-2" />

      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-5 relative z-10">

        {/* Compact Header Bar */}
        <header className="p-3.5 glass-card rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                Dashboard Admin
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pilih menu di bawah untuk membuka modul administrator
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/settings/profile"
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Profil Pengguna"
            >
              <User className="w-4 h-4" />
            </Link>
            <ThemeToggle />
            <LogoutButton size="sm" />
          </div>
        </header>

        {/* Minimal Compact Metro Tiles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {compactTiles.map((tile) => {
            const IconComp = tile.icon;
            return (
              <Link
                key={tile.id}
                href={tile.href}
                className={`glass-card p-4 rounded-lg border-l-4 ${tile.accentGradient} hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all group flex flex-col justify-between space-y-3 cursor-pointer`}
              >
                {/* Top Row: Icon & Arrow Indicator */}
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-md ${tile.iconBg} ${tile.iconColor}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Main Content: Title & Big Metric */}
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {tile.title}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    {tile.metric}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-0.5">
                    {tile.subtitle}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Global Footer */}
        <Footer />

      </div>
    </div>
  );
}
