'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Scale,
  ArrowLeftRight,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const getToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('trashure_token') || localStorage.getItem('token') || '';
};

interface DashboardStats {
  total_warga: number;
  total_petugas: number;
  setoran_7_hari: number;
  persen_setoran: number;
  transaksi_hari_ini: number;
}

export default function StatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getToken();
        const headers: HeadersInit = { Accept: 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE_URL}/admin/dashboard`, { headers });
        if (res.ok) {
          const json = await res.json();
          setStats(json.data?.stats || null);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatKg = (v: number) => v.toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' kg';
  const formatNum = (v: number) => v.toLocaleString('id-ID');

  const cards = [
    {
      title: 'Total Warga',
      value: loading ? '...' : formatNum(stats?.total_warga ?? 0),
      icon: Users,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Total Petugas',
      value: loading ? '...' : formatNum(stats?.total_petugas ?? 0),
      icon: UserCheck,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      title: 'Total Setoran (7 Hari)',
      value: loading ? '...' : formatKg(stats?.setoran_7_hari ?? 0),
      icon: Scale,
      change: stats?.persen_setoran != null ? `${stats.persen_setoran > 0 ? '+' : ''}${stats.persen_setoran}%` : undefined,
      changeLabel: 'dari 7 hari sebelumnya',
      isPositive: (stats?.persen_setoran ?? 0) >= 0,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      title: 'Transaksi Hari Ini',
      value: loading ? '...' : formatNum(stats?.transaksi_hari_ini ?? 0),
      icon: ArrowLeftRight,
      link: '/admin/transaksi-penjualan',
      linkLabel: 'Lihat detail transaksi',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5 lg:mb-6">
      {cards.map((stat) => (
        <div
          key={stat.title}
          className="relative bg-white rounded-lg sm:rounded-xl border border-gray-200/80 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow duration-300 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative">
            <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-3">
              <div className={`flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-lg ${stat.iconBg} flex-shrink-0`}>
                <stat.icon className={`h-4 sm:h-[18px] w-4 sm:w-[18px] ${stat.iconColor}`} strokeWidth={1.8} />
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-gray-500 leading-tight line-clamp-2">{stat.title}</span>
            </div>

            <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-1.5 truncate">{stat.value}</p>

            {stat.change && (
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] flex-wrap">
                <span className={`flex items-center gap-0.5 font-semibold whitespace-nowrap ${stat.isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                  <TrendingUp className="h-2.5 sm:h-3 w-2.5 sm:w-3 flex-shrink-0" />
                  {stat.change}
                </span>
                <span className="text-gray-400 line-clamp-1">{stat.changeLabel}</span>
              </div>
            )}

            {stat.link && (
              <a
                href={stat.link}
                className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-[#16a34a] hover:text-[#15803d] transition-colors mt-1 sm:mt-0 truncate"
              >
                {stat.linkLabel}
                <ExternalLink className="h-2.5 sm:h-3 w-2.5 sm:w-3 flex-shrink-0" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
