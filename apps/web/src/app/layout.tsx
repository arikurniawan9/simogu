import './globals.css';
import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { BottomNav } from '@/components/bottom-nav';
import { PwaInstaller } from '@/components/pwa-installer';

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'SIMOGU — Sistem Monitoring Kehadiran Guru',
  description: 'Sistem Monitoring Kehadiran Guru Terpadu, Real-time, dan Transparan.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SIMOGU',
  },
  applicationName: 'SIMOGU',
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen pb-20 md:pb-0 relative overflow-x-hidden">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {/* Persistent Ambient Background Blobs for 60fps GPU smoothness across route transitions */}
          <div className="ambient-blob-1 pointer-events-none" aria-hidden="true" />
          <div className="ambient-blob-2 pointer-events-none" aria-hidden="true" />
          
          <main className="relative z-10 min-h-screen">
            {children}
          </main>
          <PwaInstaller />
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
