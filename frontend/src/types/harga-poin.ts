export type KategoriSampah = 'Plastik' | 'Kertas' | 'Logam' | 'Kaca' | 'Organik' | 'Lainnya';

export type StatusHarga = 'Aktif' | 'Nonaktif';

export interface JenisSampahDB {
  id: number;
  nama: string;
  kategori: KategoriSampah;
  satuan: string;
  keterangan?: string;
  iconType?: string;
}

export interface HargaPoinItem {
  id: string | number;
  jenisSampahId: number;
  namaJenisSampah: string;
  kategori: KategoriSampah;
  satuan: string;
  hargaPerSatuan: number;
  nilaiPoinPerSatuan: number;
  berlakuMulai: string;
  berlakuSelesai?: string | null;
  status: StatusHarga;
  keterangan?: string;
  iconType?: string;
}

export interface HargaPoinFormData {
  jenisSampahId: number;
  hargaPerSatuan: number;
  nilaiPoinPerSatuan: number;
  berlakuMulai: string;
  berlakuSelesai?: string;
  status: StatusHarga;
  keterangan?: string;
}

export interface FilterState {
  search: string;
  jenisSampah: string;
  kategori: string;
  satuan: string;
}
