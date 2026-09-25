'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/layout/header';
import { Download, FileBarChart, FileText, Calendar, CalendarRange, Loader2 } from 'lucide-react';

type TabId = 'setoran' | 'penjemputan' | 'penjualan' | 'stok' | 'poin';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'setoran', label: 'Setoran', icon: FileBarChart },
  { id: 'penjemputan', label: 'Penjemputan', icon: FileText },
  { id: 'penjualan', label: 'Penjualan', icon: FileBarChart },
  { id: 'stok', label: 'Stok', icon: FileBarChart },
  { id: 'poin', label: 'Poin', icon: FileBarChart },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const getToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('trashure_token') || localStorage.getItem('token') || '';
};

const formatRupiah = (val: any) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(val) || 0);

const safeToFixed = (val: any, digits = 2) => {
  const num = Number(val);
  return isNaN(num) ? (0).toFixed(digits) : num.toFixed(digits);
};

const toISODate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState<TabId>('setoran');
  const [filterMode, setFilterMode] = useState<'bulan' | 'range'>('bulan');
  const [bulan, setBulan] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [dari, setDari] = useState(() => {
    const now = new Date();
    return toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
  });
  const [sampai, setSampai] = useState(() => toISODate(new Date()));
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});

  const buildParams = () => {
    if (activeTab === 'stok') return '';
    if (filterMode === 'range') return `?dari=${dari}&sampai=${sampai}`;
    return `?bulan=${bulan}`;
  };

  useEffect(() => {
    let isCurrent = true;
    const currentTab = activeTab;

    const loadData = async () => {
      setLoading(true);
      setData([]);
      setSummary({});
      try {
        const params = currentTab === 'stok' ? '' : filterMode === 'range' ? `?dari=${dari}&sampai=${sampai}` : `?bulan=${bulan}`;
        const res = await fetch(`${API_BASE_URL}/admin/laporan-data/${currentTab}${params}`, {
          headers: { Authorization: `Bearer ${getToken()}`, Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('Gagal memuat data');
        const json = await res.json();
        if (isCurrent) {
          setData(Array.isArray(json.data) ? json.data : []);
          setSummary(json.summary || {});
        }
      } catch (err) {
        if (isCurrent) {
          console.error(err);
          setData([]);
          setSummary({});
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCurrent = false;
    };
  }, [activeTab, bulan, dari, sampai, filterMode]);

  const handleDownload = async () => {
    const params = buildParams();
    const token = getToken();
    const label = filterMode === 'range' ? `${dari}_sd_${sampai}` : bulan;
    setDownloading(true);
    try {
      const url = `${API_BASE_URL}/download/laporan/${activeTab}${params ? params + '&' : '?'}token=${token}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf, application/json',
        },
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || 'Gagal mengunduh file PDF.');
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `laporan-${activeTab}-${label}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      console.error('Download error:', err);
      alert(err.message || 'Terjadi kesalahan saat mengunduh PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#16a34a]" />
          <p className="text-sm text-gray-500 mt-3">Memuat data...</p>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-16 text-gray-400 text-sm">
          Tidak ada data untuk periode ini.
        </div>
      );
    }

    if (activeTab === 'setoran') {
      return (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">No</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Tanggal</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Warga</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Petugas</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Berat (kg)</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Poin</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={item.setoran_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                <td className="px-4 py-3 text-gray-700">{item.tanggal}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{item.nama_warga}</td>
                <td className="px-4 py-3 text-gray-600">{item.nama_petugas}</td>
                <td className="px-4 py-3 text-right text-gray-700">{safeToFixed(item.berat, 2)}</td>
                <td className="px-4 py-3 text-right font-semibold text-amber-600">{item.poin ?? 0}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                    item.status === 'disetujui' ? 'bg-emerald-50 text-emerald-700' :
                    item.status === 'ditolak' ? 'bg-red-50 text-red-700' :
                    'bg-yellow-50 text-yellow-700'
                  }`}>{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeTab === 'penjemputan') {
      return (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">No</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Tanggal</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Warga</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Petugas</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={item.jadwal_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                <td className="px-4 py-3 text-gray-700">{item.tanggal}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{item.nama_warga}</td>
                <td className="px-4 py-3 text-gray-600">{item.nama_petugas}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                    item.status === 'selesai' ? 'bg-emerald-50 text-emerald-700' :
                    item.status === 'dibatalkan' ? 'bg-red-50 text-red-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeTab === 'penjualan') {
      return (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">No. Transaksi</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Tanggal</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Pengepul</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Media</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Metode</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Jenis Sampah</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Total Berat</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Total Harga</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.penjualan_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 font-bold text-gray-900">PJL-{String(item.penjualan_id).padStart(4, '0')}</td>
                <td className="px-4 py-3 text-gray-700">{item.tanggal}</td>
                <td className="px-4 py-3 font-semibold text-gray-800">{item.nama_pengepul}</td>
                <td className="px-4 py-3 text-gray-600">{item.media_konfirmasi}</td>
                <td className="px-4 py-3 text-gray-600">{item.metode_transaksi}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.detail_penjualan?.map((d: any) => (
                      <span key={d.detail_penjualan_id} className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-md">
                        {d.nama_jenis_sampah}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">{safeToFixed(item.total_berat, 1)} kg</td>
                <td className="px-4 py-3 text-right font-semibold text-[#16a34a]">{formatRupiah(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeTab === 'stok') {
      return (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">No</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Jenis Sampah</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Stok</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Satuan</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={item.stok_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{item.nama_jenis || '-'}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-700">{safeToFixed(item.jumlah_stok, 2)}</td>
                <td className="px-4 py-3 text-gray-600">{item.satuan || 'kg'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeTab === 'poin') {
      return (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">No</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Tanggal</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Warga</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Voucher</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase">Poin</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={item.penukaran_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                <td className="px-4 py-3 text-gray-700">{item.tanggal}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{item.nama_warga}</td>
                <td className="px-4 py-3 text-gray-600">{item.nama_voucher}</td>
                <td className="px-4 py-3 text-right font-semibold text-amber-600">{item.poin_digunakan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return null;
  };

  return (
    <div className="max-w-[1440px] mx-auto pb-16 font-sans">
      <AdminHeader
        title="Laporan"
        subtitle="Lihat dan unduh laporan operasional Bank Sampah."
        breadcrumbs={[
          { label: 'Beranda', href: '/admin/dashboard' },
          { label: 'Laporan' },
        ]}
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200/80 p-1 shadow-sm mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#16a34a] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter & Export */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Toggle Bulan / Range */}
          <div className="flex items-center bg-white rounded-xl border border-gray-200/80 p-0.5 shadow-sm">
            <button
              onClick={() => setFilterMode('bulan')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'bulan' ? 'bg-[#16a34a] text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Bulan
            </button>
            <button
              onClick={() => setFilterMode('range')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'range' ? 'bg-[#16a34a] text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <CalendarRange className="h-3.5 w-3.5" />
              Range Tanggal
            </button>
          </div>

          {/* Input Filter */}
          {filterMode === 'bulan' ? (
            <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200/80 px-4 py-2.5 shadow-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="month"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="text-sm text-gray-700 border-none outline-none bg-transparent font-medium"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200/80 px-4 py-2.5 shadow-sm">
              <CalendarRange className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={dari}
                onChange={(e) => setDari(e.target.value)}
                className="text-sm text-gray-700 border-none outline-none bg-transparent font-medium"
              />
              <span className="text-gray-400 text-xs">s/d</span>
              <input
                type="date"
                value={sampai}
                onChange={(e) => setSampai(e.target.value)}
                className="text-sm text-gray-700 border-none outline-none bg-transparent font-medium"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleDownload}
          disabled={loading || downloading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16a34a] text-white text-sm font-bold hover:bg-[#15803d] shadow-sm shadow-green-200 transition-all disabled:opacity-50"
        >
          {downloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Mengunduh...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export PDF
            </>
          )}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {activeTab === 'setoran' && (
          <>
            <SummaryCard label="Total Transaksi" value={summary.total || 0} />
            <SummaryCard label="Total Berat" value={`${safeToFixed(summary.total_berat, 1)} kg`} />
            <SummaryCard label="Total Poin" value={summary.total_poin || 0} />
          </>
        )}
        {activeTab === 'penjemputan' && (
          <>
            <SummaryCard label="Total" value={summary.total || 0} />
            <SummaryCard label="Selesai" value={summary.selesai || 0} />
            <SummaryCard label="Dibatalkan" value={summary.dibatalkan || 0} />
          </>
        )}
        {activeTab === 'penjualan' && (
          <>
            <SummaryCard label="Total Transaksi" value={summary.total || 0} />
            <SummaryCard label="Total Berat" value={`${safeToFixed(summary.total_berat, 1)} kg`} />
            <SummaryCard label="Total Penjualan" value={formatRupiah(summary.total_penjualan || 0)} />
          </>
        )}
        {activeTab === 'stok' && (
          <>
            <SummaryCard label="Jenis Sampah" value={summary.total_jenis || 0} />
            <SummaryCard label="Total Stok" value={`${safeToFixed(summary.total_stok, 1)} kg`} />
          </>
        )}
        {activeTab === 'poin' && (
          <>
            <SummaryCard label="Total Penukaran" value={summary.total || 0} />
            <SummaryCard label="Total Poin" value={summary.total_poin || 0} />
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {renderTable()}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
