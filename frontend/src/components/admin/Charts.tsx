'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const getToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('trashure_token') || localStorage.getItem('token') || '';
};

interface GrafikItem {
  name: string;
  value: number;
}

interface KomposisiItem {
  name: string;
  value: number;
  percentage: string;
}

const KOMPOSISI_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#6366f1', '#64748b', '#94a3b8', '#ec4899', '#14b8a6'];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-gray-900 px-3 py-2 shadow-lg">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-bold text-white">{payload[0].value}</p>
      </div>
    );
  }
  return null;
}

function RoundedBar(props: { x?: number; y?: number; width?: number; height?: number; fill?: string }) {
  const { x = 0, y = 0, width = 0, height = 0, fill } = props;
  const radius = 4;
  if (height <= 0) return null;
  return (
    <rect x={x} y={y} width={width} height={height} fill={fill} rx={radius} ry={radius} />
  );
}

interface DashboardChartsProps {
  initialGrafikSetoran?: GrafikItem[];
  initialKomposisi?: KomposisiItem[];
  initialTotalKomposisi?: number;
}

export function SetoranChart({ data }: { data: GrafikItem[] }) {
  const totalBerat = data.reduce((acc, d) => acc + d.value, 0);
  const rataRata = data.length > 0 ? totalBerat / data.length : 0;

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/80 p-3 sm:p-4 lg:p-5 shadow-sm">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-bold text-gray-800">Grafik Setoran Sampah (kg)</h3>
      </div>

      <div className="h-[150px] sm:h-[180px] lg:h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
            <defs>
              <linearGradient id="setoranGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(22, 163, 74, 0.05)' }} />
            <Bar dataKey="value" fill="url(#setoranGradient)" shape={<RoundedBar />} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 lg:gap-8 mt-2 sm:mt-3 lg:mt-4 pt-2 sm:pt-3 lg:pt-3 border-t border-gray-100">
        <div>
          <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5">Total Berat</p>
          <p className="text-sm sm:text-base font-bold text-gray-800">{totalBerat.toLocaleString('id-ID', { maximumFractionDigits: 1 })} kg</p>
        </div>
        <div>
          <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5">Rata-rata per Hari</p>
          <p className="text-sm sm:text-base font-bold text-gray-800">{rataRata.toLocaleString('id-ID', { maximumFractionDigits: 1 })} kg</p>
        </div>
      </div>
    </div>
  );
}

export function KomposisiChart({ data, total }: { data: KomposisiItem[]; total: number }) {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/80 p-3 sm:p-4 lg:p-5 shadow-sm">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-bold text-gray-800">Komposisi Jenis Sampah (kg)</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <div className="h-[140px] sm:h-[160px] lg:h-[180px] w-[140px] sm:w-[160px] lg:w-[180px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={KOMPOSISI_COLORS[index % KOMPOSISI_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-1">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
              <span
                className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: KOMPOSISI_COLORS[index % KOMPOSISI_COLORS.length] }}
              />
              <span className="text-gray-600 flex-1 min-w-0">{item.name}</span>
              <span className="font-semibold text-gray-800 whitespace-nowrap text-[9px] sm:text-[10px]">{item.value} kg ({item.percentage})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Total: <span className="font-bold text-gray-800">{total.toLocaleString('id-ID', { maximumFractionDigits: 1 })} kg</span>
        </p>
      </div>
    </div>
  );
}
