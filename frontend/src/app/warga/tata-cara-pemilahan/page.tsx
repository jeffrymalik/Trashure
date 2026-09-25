'use client';

import AdminHeader from '@/components/layout/header';
import { Leaf, Recycle, Droplets, Package, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const jenisSampah = [
  {
    kategori: 'Organik',
    warna: 'bg-green-500',
    bgCard: 'bg-green-50',
    borderCard: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    Icon: Leaf,
    contoh: ['Sisa makanan', 'Kulit buah & sayur', 'Daun kering', 'Ranting pohon'],
    cara: 'Buang isinya, cuci singkat, tiriskan, lalu masukkan ke wadah khusus organik.',
    tips: 'Bisa dijadikan kompos atau pupuk organik untuk tanaman.',
  },
  {
    kategori: 'Plastik',
    warna: 'bg-blue-500',
    bgCard: 'bg-blue-50',
    borderCard: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    Icon: Recycle,
    contoh: ['Botol PET', 'Kantong plastik', 'Wadah makanan', 'Plastik kemasan'],
    cara: 'Buang isinya, cuci dengan air, keringkan, lalu kempeskan untuk menghemat tempat.',
    tips: 'Pisahkan berdasarkan jenis (PET, HDPE, PP). Cuci bersih sebelum disetorkan.',
  },
  {
    kategori: 'Kertas & Kardus',
    warna: 'bg-amber-500',
    bgCard: 'bg-amber-50',
    borderCard: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    Icon: Package,
    contoh: ['Kardus bekas', 'Kertas HVS', 'Majalah & koran', 'Buku bekas'],
    cara: 'Buang staples, lipat rapi kardus, ikat jika banyak. Pastikan tidak basah.',
    tips: 'Lipat kardus agar hemat tempat. Pisahkan dari plastik dan logam.',
  },
  {
    kategori: 'Logam & Kaleng',
    warna: 'bg-gray-500',
    bgCard: 'bg-gray-50',
    borderCard: 'border-gray-200',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    Icon: Droplets,
    contoh: ['Kaleng aluminium', 'Kaleng besi', 'Limbah logam kecil', 'Tutup botol'],
    cara: 'Buang sisa isinya, cuci dengan air, keringkan. Kempeskan kaleng aluminium.',
    tips: 'Kaleng aluminium memiliki nilai poin lebih tinggi dari besi.',
  },
];

const langkahPemilahan = [
  { langkah: 1, title: 'Siapkan Wadah Terpisah', desc: 'Sediakan minimal 4 wadah untuk organik, plastik, kertas, dan logam.' },
  { langkah: 2, title: 'Pisahkan di Sumber', desc: 'Pisahkan sampah segera saat dibuang. Jangan campur aduk.' },
  { langkah: 3, title: 'Bersihkan Sampah', desc: 'Cuci kemasan plastik dan kaleng untuk menghindari bau dan menjaga kualitas.' },
  { langkah: 4, title: 'Kempeskan & Lipat', desc: 'Kempeskan botol dan kaleng, lipat kardus untuk menghemat tempat.' },
  { langkah: 5, title: 'Setorkan ke Bank Sampah', desc: 'Bawa sampah yang sudah dipilah ke bank sampah terdekat atau jadwalkan penjemputan.' },
];

export default function TataCaraPemilahanPage() {
  return (
    <div className="w-full">
      <AdminHeader
        title="Tata Cara Pemilahan Sampah"
        subtitle="Panduan memilah sampah dengan benar untuk lingkungan yang lebih bersih."
      />

      {/* Back Button */}
      <Link
        href="/warga/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#16a34a] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dashboard
      </Link>

      {/* Langkah Pemilahan */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5 sm:p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Langkah Pemilahan Sampah</h2>
        <div className="space-y-4">
          {langkahPemilahan.map((item) => (
            <div key={item.langkah} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#16a34a] text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                {item.langkah}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Jenis Sampah */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Jenis-Jenis Sampah</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {jenisSampah.map((item) => {
          const Icon = item.Icon;
          return (
            <div key={item.kategori} className={`${item.bgCard} rounded-xl border ${item.borderCard} p-5`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg ${item.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-gray-900">{item.kategori}</h3>
              </div>

              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Contoh:</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.contoh.map((c) => (
                    <span key={c} className="text-xs bg-white/70 px-2 py-0.5 rounded-full text-gray-600 border border-gray-200/50">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Cara Memilah:</p>
                <p className="text-sm text-gray-700">{item.cara}</p>
              </div>

              <div className="flex items-start gap-2 bg-white/60 rounded-lg p-2.5 mt-2">
                <CheckCircle2 className={`w-4 h-4 ${item.iconColor} flex-shrink-0 mt-0.5`} />
                <p className="text-xs text-gray-600">{item.tips}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips Tambahan */}
      <div className="bg-gradient-to-r from-[#16a34a] to-[#22c55e] rounded-xl p-5 sm:p-6 text-white">
        <h3 className="text-base font-bold mb-3">Tips Penting</h3>
        <ul className="space-y-2">
          {[
            'Jangan memilah sampah yang sudah tercampur bahan berbahaya (baterai, lampu neon).',
            'Pastikan sampah dalam kondisi kering sebelum disetorkan.',
            'Pisahkan sampah B3 (Bahan Berbahaya & Beracun) dari sampah rumah tangga biasa.',
            'Semakin bersih sampah yang disetorkan, semakin tinggi nilainya.',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-green-100">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
