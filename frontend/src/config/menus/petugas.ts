import {
  LayoutDashboard,
  Truck,
  Clock,
  FileText,
  User,
} from 'lucide-react';
import type { MenuSection } from '@/components/layout/sidebar';

export const petugasMenus: MenuSection[] = [
  {
    title: '',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/petugas/dashboard' },
    ],
  },
  {
    title: 'PENJEMPUTAN',
    items: [
      {
        label: 'Penjemputan',
        icon: Truck,
        children: [
          { label: 'Tugas Saya', icon: Truck, href: '/petugas/penjemputan' },
          { label: 'Riwayat Penjemputan', icon: Clock, href: '/petugas/riwayat-penjemputan' },
        ],
      },
    ],
  },
  {
    title: 'SETORAN',
    items: [
      { label: 'Riwayat Setoran', icon: FileText, href: '/petugas/riwayat-setoran' },
    ],
  },
  {
    title: 'PROFIL',
    items: [
      { label: 'Profil Saya', icon: User, href: '/petugas/profil' },
    ],
  },
];
