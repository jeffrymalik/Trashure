'use client';

import { ExternalLink, Truck, Package, Star, FileText, Scale } from 'lucide-react';

interface PengajuanRow {
  no: string;
  warga: string;
  tanggal_ajukan: string;
  jadwal: string;
  petugas: string;
  status: string;
  status_color: string;
}

interface SetoranRow {
  nama: string;
  tanggal: string;
  berat: string;
  jenis: string;
  status: string;
  status_color: string;
}

interface AktivitasRow {
  text: string;
  time: string;
  type: string;
}

const TIPE_ICONS: Record<string, typeof Truck> = {
  pengajuan: Truck,
  setoran: Scale,
  poin: Star,
  default: FileText,
};

const TIPE_BG: Record<string, string> = {
  pengajuan: 'bg-blue-100',
  setoran: 'bg-emerald-100',
  poin: 'bg-amber-100',
  default: 'bg-gray-100',
};

const TIPE_COLOR: Record<string, string> = {
  pengajuan: 'text-blue-600',
  setoran: 'text-emerald-600',
  poin: 'text-amber-600',
  default: 'text-gray-600',
};

export function PengajuanTable({ data }: { data: PengajuanRow[] }) {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-4 border-b border-gray-100">
        <h3 className="text-xs sm:text-sm font-bold text-gray-800">Pengajuan Penjemputan</h3>
        <a href="/admin/pengajuan-penjemputan" className="text-[10px] sm:text-xs font-medium text-[#16a34a] hover:text-[#15803d] flex items-center gap-1 transition-colors whitespace-nowrap">
          Lihat Semua <ExternalLink className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-left text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">No.</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-left text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Warga</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-left text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tgl Ajukan</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-left text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Jadwal</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-left text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Petugas</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-left text-[9px] sm:text-[10px] lg:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-xs text-gray-400">Belum ada pengajuan</td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.no} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium text-gray-700 truncate">{row.no}</td>
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs text-gray-600 truncate">{row.warga}</td>
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs text-gray-500 truncate whitespace-nowrap">{row.tanggal_ajukan}</td>
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs text-gray-500 truncate">{row.jadwal}</td>
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs text-gray-600 truncate">{row.petugas}</td>
                  <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5">
                    <span className={`inline-flex items-center rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold whitespace-nowrap ${row.status_color}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


    </div>
  );
}

export function SetoranValidasiList({ data }: { data: SetoranRow[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-800">Setoran Menunggu Validasi</h3>
        <a href="/admin/validasi-setoran" className="text-xs font-medium text-[#16a34a] hover:text-[#15803d] flex items-center gap-1 transition-colors">
          Lihat Semua <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="divide-y divide-gray-50">
        {data.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-gray-400">Tidak ada setoran menunggu validasi</div>
        ) : (
          data.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 sm:gap-3 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 hover:bg-gray-50/50 transition-colors">
              <div className="flex h-7 sm:h-8 lg:h-9 w-7 sm:w-8 lg:w-9 items-center justify-center rounded-lg bg-amber-50 flex-shrink-0">
                <Package className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-amber-500" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-gray-800 truncate">{item.nama}</p>
                <p className="text-[9px] sm:text-[10px] text-gray-400 truncate">{item.tanggal}</p>
                <p className="text-[9px] sm:text-[10px] text-gray-400 truncate">{item.jenis}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs sm:text-sm font-bold text-gray-800 whitespace-nowrap">{item.berat}</p>
                <span className={`inline-flex items-center rounded-full px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] lg:text-[10px] font-semibold whitespace-nowrap ${item.status_color}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function AktivitasTerbaru({ data }: { data: AktivitasRow[] }) {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-4 border-b border-gray-100">
        <h3 className="text-xs sm:text-sm font-bold text-gray-800">Aktivitas Terbaru</h3>
        <a href="#" className="text-[10px] sm:text-xs font-medium text-[#16a34a] hover:text-[#15803d] flex items-center gap-1 transition-colors whitespace-nowrap">
          Lihat Semua <ExternalLink className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
        </a>
      </div>

      <div className="divide-y divide-gray-50">
        {data.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs text-gray-400">Belum ada aktivitas</div>
        ) : (
          data.map((item, idx) => {
            const Icon = TIPE_ICONS[item.type] || TIPE_ICONS.default;
            const bg = TIPE_BG[item.type] || TIPE_BG.default;
            const color = TIPE_COLOR[item.type] || TIPE_COLOR.default;
            return (
              <div key={idx} className="flex items-start gap-2 sm:gap-3 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 hover:bg-gray-50/50 transition-colors">
                <div className={`flex h-7 sm:h-8 w-7 sm:w-8 items-center justify-center rounded-lg ${bg} flex-shrink-0 mt-0.5`}>
                  <Icon className={`h-3.5 sm:h-4 w-3.5 sm:w-4 ${color}`} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-700 leading-relaxed">{item.text}</p>
                </div>
                <span className="text-[9px] sm:text-[10px] text-gray-400 flex-shrink-0 whitespace-nowrap">{item.time}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
