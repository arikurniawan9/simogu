'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { ConfirmationModal } from '@/components/confirmation-modal';

interface LogoutButtonProps {
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function LogoutButton({ size = 'md', showLabel = true }: LogoutButtonProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('simogu_token');
      localStorage.removeItem('simogu_user');
      localStorage.removeItem('simogu_refresh_token');
    }
    setModalOpen(false);
    router.replace('/login');
  };

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const btnPadding = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs';

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`flex items-center gap-1.5 ${btnPadding} rounded-md font-semibold
          bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60
          text-red-600 dark:text-red-400
          border border-red-200 dark:border-red-800
          transition-all duration-150 hover:shadow-sm
          focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1`}
        title="Keluar dari sistem"
      >
        <LogOut className={iconSize} />
        {showLabel && <span>Logout</span>}
      </button>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleLogout}
        title="Konfirmasi Logout"
        description="Apakah Anda yakin ingin keluar dari sistem? Sesi Anda akan berakhir dan Anda perlu login kembali."
        variant="danger"
        confirmText="Ya, Logout"
      />
    </>
  );
}
