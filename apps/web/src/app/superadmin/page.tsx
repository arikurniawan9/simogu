'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccessDenied } from '@/components/access-denied';

export default function SuperAdminRootPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('simogu_token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('simogu_user') : null;

    if (!token || !userStr) {
      setIsAuthorized(false);
      setUserRole(null);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setUserRole(user.role);

      if (user.role === 'SUPER_ADMIN') {
        setIsAuthorized(true);
        router.replace('/superadmin/dashboard');
      } else {
        setIsAuthorized(false);
      }
    } catch {
      setIsAuthorized(false);
    }
  }, [router]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-xs font-semibold text-slate-500 animate-pulse">Memeriksa Otoritas SuperAdmin...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <AccessDenied
        requiredRole="SUPER ADMIN"
        userRole={userRole}
        message="Halaman ini khusus untuk Super Admin (Otoritas Sistem Tertinggi)."
      />
    );
  }

  return null;
}
