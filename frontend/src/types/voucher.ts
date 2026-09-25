export type StatusVoucher = 'tersedia' | 'habis' | 'tidak_aktif';

export interface VoucherItem {
  id: number | string;
  namaVoucher: string;
  deskripsi?: string | null;
  poinDibutuhkan: number;
  jumlahTersedia: number;
  totalDitukar?: number;
  status: StatusVoucher;
  createdAt?: string;
  updatedAt?: string;
}

export interface VoucherFormData {
  namaVoucher: string;
  deskripsi?: string;
  poinDibutuhkan: number;
  jumlahTersedia: number;
  status: StatusVoucher;
}

export interface FilterState {
  search: string;
  status: string;
}