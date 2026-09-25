'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PengajuanPenjemputanRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/warga/ajukan-penjemputan');
  }, [router]);

  return null;
}
