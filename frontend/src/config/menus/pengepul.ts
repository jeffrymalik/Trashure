import {
  LayoutDashboard,
  Package,
  User,
} from 'lucide-react';
import type { MenuSection } from '@/components/layout/sidebar';

export const pengepulMenus: MenuSection[] = [
  {
    title: '',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/pengepul/dashboard' },
    ],
  },
  {
    title: 'STOK',
    items: [
      { label: 'Stok Sampah', icon: Package, href: '/pengepul/stok-sampah' },
    ],
  },
  {
    title: 'PROFIL',
    items: [
      { label: 'Profil Saya', icon: User, href: '/pengepul/profil' },
    ],
  },
];