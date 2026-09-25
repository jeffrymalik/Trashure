import {
  LayoutDashboard,
  Users,
  UserCheck,
  Truck,
  Recycle,
  ArrowLeftRight,
  ShieldCheck,
  FileText,
  FileBarChart,
  PackageSearch,
  BadgeDollarSign,
  Ticket,
  User,
} from 'lucide-react';
import type { MenuSection } from '@/components/layout/sidebar';

export const adminMenus: MenuSection[] = [
  {
    title: '',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    ],
  },
  {
    title: 'MASTER DATA',
    items: [
      {
        label: 'Pengguna',
        icon: Users,
        children: [
          { label: 'Warga', icon: Users, href: '/admin/pengguna/warga' },
          { label: 'Petugas', icon: UserCheck, href: '/admin/pengguna/petugas' },
          { label: 'Pengepul', icon: Truck, href: '/admin/pengguna/pengepul' },
        ],
      },
      { label: 'Jenis Sampah', icon: PackageSearch, href: '/admin/jenis-sampah' },
      { label: 'Harga & Poin', icon: BadgeDollarSign, href: '/admin/harga-poin' },
      { label: 'Voucher', icon: Ticket, href: '/admin/voucher' },
    ],
  },
  {
    title: 'TRANSAKSI',
    items: [
      { label: 'Pengajuan Penjemputan', icon: FileText, href: '/admin/pengajuan-penjemputan' },
      { label: 'Setoran Sampah', icon: Recycle, href: '/admin/setoran-sampah' },
      { label: 'Transaksi Penjualan', icon: BadgeDollarSign, href: '/admin/transaksi-penjualan' },
      { label: 'Penukaran Poin', icon: ArrowLeftRight, href: '/admin/penukaran-poin' },
    ],
  },
  {
    title: 'VALIDASI',
    items: [
      { label: 'Validasi Setoran', icon: ShieldCheck, href: '/admin/validasi-setoran' },
    ],
  },
  {
    title: 'LAPORAN',
    items: [
      { label: 'Laporan', icon: FileBarChart, href: '/admin/laporan' },
    ],
  },
  {
    title: 'PROFIL',
    items: [
      { label: 'Profil Saya', icon: User, href: '/admin/profil' },
    ],
  },
];
