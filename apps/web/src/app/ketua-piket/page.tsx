'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KetuaPiketRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ketua-piket/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-xs font-semibold text-slate-500 animate-pulse">
        Memuat Dashboard Ketua Piket...
      </div>
    </div>
  );
}
