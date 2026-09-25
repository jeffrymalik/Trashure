import { getAuthHeaders, getApiUrl } from './wargaPengajuanService';

export interface RiwayatPoinItem {
  tanggal: string;
  jenis_sampah: string;
  berat: number;
  satuan: string;
  poin: number;
}

export interface PoinData {
  total_poin: number;
  riwayat: RiwayatPoinItem[];
}

export const DEFAULT_POIN_DATA: PoinData = {
  total_poin: 0,
  riwayat: [],
};

export async function fetchWargaPoin(
  tanggalMulai?: string,
  tanggalAkhir?: string,
  sort: string = 'terbaru'
): Promise<PoinData> {
  try {
    const query = new URLSearchParams();
    if (tanggalMulai) query.append('tanggal_mulai', tanggalMulai);
    if (tanggalAkhir) query.append('tanggal_akhir', tanggalAkhir);
    query.append('sort', sort);

    const url = `${getApiUrl()}/warga/poin${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch poin (${res.status})`);
    }

    const json = await res.json();
    return json.data || DEFAULT_POIN_DATA;
  } catch (err) {
    console.warn('Error fetching warga poin:', err);
    return DEFAULT_POIN_DATA;
  }
}
