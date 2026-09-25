import {
  Home,
  Truck,
  History,
  Star,
  Gift,
  User,
  BookOpen,
} from 'lucide-react';
import type { MenuSection } from '@/components/layout/sidebar';

export const wargaMenus: MenuSection[] = [
  {
    title: '',
    items: [
      { label: 'Beranda', icon: Home, href: '/warga/dashboard' },
    ],
  },
    {
    title: 'EDUKASI',
    items: [
      { label: 'Tata Cara Pemilahan', icon: BookOpen, href: '/warga/tata-cara-pemilahan' },
    ],
  },
  {
    title: 'LAYANAN',
    items: [
      { label: 'Pengajuan Penjemputan', icon: Truck, href: '/warga/ajukan-penjemputan' },
      { label: 'Riwayat Setoran', icon: History, href: '/warga/riwayat-setoran' },
    ],
  },
  {
    title: 'POIN & REWARD',
    items: [
      { label: 'Poin Saya', icon: Star, href: '/warga/poin-saya' },
      { label: 'Penukaran Poin', icon: Gift, href: '/warga/penukaran-poin' },
      { label: 'Riwayat Penukaran', icon: History, href: '/warga/riwayat-penukaran' },
    ],
  },
  {
    title: 'AKUN',
    items: [
      { label: 'Profil Saya', icon: User, href: '/warga/profil' },
    ],
  },
];
