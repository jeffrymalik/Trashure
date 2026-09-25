'use client';

import { useEffect, useState } from 'react';
import { Star, Info, Trash2, Users, Gift } from 'lucide-react';
import AdminHeader from '@/components/layout/header';
import { fetchWargaPoin, PoinData, DEFAULT_POIN_DATA } from '@/services/wargaPoinService';

export default function WargaPoinPage() {
  const [poin, setPoin] = useState<PoinData>(DEFAULT_POIN_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');
  const [sort, setSort] = useState('terbaru');

  const loadPoin = async () => {
    setIsLoading(true);
    const data = await fetchWargaPoin(tanggalMulai, tanggalAkhir, sort);
    setPoin(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPoin();
  }, [tanggalMulai, tanggalAkhir, sort]);

  const handleReset = () => {
    setTanggalMulai('');
    setTanggalAkhir('');
    setSort('terbaru');
    setIsLoading(true);
    fetchWargaPoin('', '', 'terbaru').then((data) => {
      setPoin(data);
      setIsLoading(false);
    });
  };

  return (
    <div className="w-full">
      <AdminHeader
        title="Poin Saya"
        subtitle="Kelola dan pantau riwayat poin sampah Anda."
      />

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl border border-green-200/80 p-4 sm:p-5 lg:p-6 shadow-sm mb-4 sm:mb-5 lg:mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white rounded-lg p-3">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Poin Saya</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? '-' : poin.total_poin.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white rounded-lg p-4 mt-4 border border-green-100">
          <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">
            Poin akan bertambah setiap kali setoran Anda divalidasi oleh admin bank sampah.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 border-b border-gray-200/80 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Riwayat Poin</h3>
              <p className="text-sm text-gray-500 mt-1">Daftar perolehan poin dari setoran sampah Anda</p>
            </div>

            <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 border-b border-gray-200/80 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={tanggalAkhir}
                    onChange={(e) => setTanggalAkhir(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urutkan</label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="terbaru">Terbaru</option>
                    <option value="terlama">Terlama</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200/80 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">No</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Jenis Sampah</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Berat</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">Poin</th>
                  </tr>
                </thead>
                <tbody>
                  {poin.riwayat.length > 0 ? (
                    poin.riwayat.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-200/80 hover:bg-gray-50/50 transition-colors">
                        <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-sm text-gray-900">{idx + 1}</td>
                        <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-sm text-gray-700">
                          {new Date(item.tanggal).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          })}
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-sm text-gray-700">{item.jenis_sampah}</td>
                        <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-sm text-gray-700 text-right">
                          {item.berat.toLocaleString('id-ID', { maximumFractionDigits: 1 })} {item.satuan}
                        </td>
                        <td className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-sm font-medium text-center">
                          <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                            <Star className="w-4 h-4 fill-green-500 text-green-500" />
                            {item.poin}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                        {isLoading ? 'Memuat data...' : 'Tidak ada riwayat poin'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200/80 p-5 sticky top-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Cara Mendapatkan Poin</h4>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 flex items-center justify-center h-9 sm:h-10 w-9 sm:w-10 rounded-lg bg-green-100">
                  <Trash2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Setor Sampah</p>
                  <p className="text-xs text-gray-600 mt-1">Setor sampah dan dapatkan poin berdasarkan berat dan jenis sampah.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 flex items-center justify-center h-9 sm:h-10 w-9 sm:w-10 rounded-lg bg-green-100">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Validasi Admin</p>
                  <p className="text-xs text-gray-600 mt-1">Admin akan memvalidasi sampah untuk mendapatkan poin.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 flex items-center justify-center h-9 sm:h-10 w-9 sm:w-10 rounded-lg bg-green-100">
                  <Gift className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Poin</p>
                  <p className="text-xs text-gray-600 mt-1">Poin Akan diberikan setelah sampah divalidasi.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
