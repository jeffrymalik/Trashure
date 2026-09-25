import { getAuthHeaders, getApiUrl } from './wargaPengajuanService';

export interface DetailSetoranItem {
  detail_setoran_id: number;
  setoran_id: number;
  jenis_sampah_id: number;
  berat_aktual: number | string;
  harga_satuan?: number | string;
  nilai_poin_per_satuan?: number;
  poin: number;
  poin_sementara?: number;
  jenis_sampah?: {
    jenis_sampah_id: number;
    nama_jenis_sampah: string;
    satuan: string;
    keterangan?: string;
  };
}

export interface SetoranItem {
  setoran_id: number;
  pengajuan_id: number;
  sumber_data?: 'pengajuan' | 'transaksi';
  jadwal_id: number;
  warga_id: number;
  petugas_id: number;
  validator_admin_id?: number | null;
  tanggal_setoran: string;
  perkiraan_tanggal_jemput?: string | null;
  perkiraan_waktu_jemput?: string | null;
  tanggal_diajukan?: string | null;
  konfirmasi_pengambilan: string;
  status_validasi: 'menunggu' | 'disetujui' | 'ditolak' | string;
  catatan_validasi?: string | null;
  catatan_pengajuan?: string | null;
  alamat_penjemputan?: string | null;
  status_pengajuan?: string | null;
  tanggal_validasi?: string | null;
  total_berat_aktual: number | string;
  total_poin: number;
  total_poin_sementara: number;
  poin: number;
  detail_setoran?: DetailSetoranItem[];
  petugas?: { petugas_id: number; nama_petugas: string; no_telepon?: string; };
  validator_admin?: { admin_id: number; nama_admin: string; };
}

export interface RingkasanSetoran {
  total_setoran: number;
  total_berat_sampah: number;
  total_poin_diterima: number;
  menunggu_validasi: number;
}

export interface SetoranFilterParams { status?: string; sort?: string; bulan?: string; }

export const DEFAULT_RINGKASAN: RingkasanSetoran = { total_setoran: 0, total_berat_sampah: 0, total_poin_diterima: 0, menunggu_validasi: 0 };

export async function fetchRiwayatSetoran(params?: SetoranFilterParams): Promise<{ data: SetoranItem[]; ringkasan: RingkasanSetoran }> {
  try {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'semua') query.append('status', params.status);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.bulan) query.append('bulan', params.bulan);
    const url = `${getApiUrl()}/warga/setoran${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch setoran (${res.status})`);
    const json = await res.json();
    return { data: json.data && Array.isArray(json.data) ? json.data : [], ringkasan: json.ringkasan || DEFAULT_RINGKASAN };
  } catch (err) {
    console.warn('Error fetching riwayat setoran:', err);
    return { data: [], ringkasan: DEFAULT_RINGKASAN };
  }
}

export async function fetchDetailSetoran(id: number, tipe?: 'pengajuan' | 'setoran'): Promise<SetoranItem | null> {
  try {
    const query = tipe ? `?tipe=${tipe}` : '';
    const res = await fetch(`${getApiUrl()}/warga/setoran/${id}${query}`, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    return (await res.json()).data || null;
  } catch (err) {
    console.warn('Error fetching detail setoran:', err);
    return null;
  }
}
