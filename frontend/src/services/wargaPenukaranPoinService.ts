import { getAuthHeaders, getApiUrl } from './wargaPengajuanService';

export interface HadiahItem {
  voucher_id: number;
  nama_voucher: string;
  deskripsi: string;
  poin_dibutuhkan: number;
  jumlah_tersedia: number;
  status: string;
}

export interface PaginationData {
  current_page: number;
  total: number;
  per_page: number;
  last_page: number;
  from: number;
  to: number;
}

export interface HadiahResponse {
  data: HadiahItem[];
  pagination: PaginationData;
}

export interface SaldoResponse {
  saldo_poin: number;
}

export interface TukarResponse {
  penukaran_id: number;
  voucher_id: number;
  poin_digunakan: number;
  saldo_sebelum: number;
  saldo_sesudah: number;
  status_penukaran: string;
}

export interface RiwayatItem {
  penukaran_id: number;
  nama_voucher: string;
  tanggal_pengajuan: string;
  poin_digunakan: number;
  status_penukaran: string;
}

export interface RiwayatResponse {
  data: RiwayatItem[];
  pagination: PaginationData;
}

export async function fetchDaftarHadiah(
  page: number = 1,
  perPage: number = 12,
  search?: string,
  sort: string = 'asc'
): Promise<HadiahResponse> {
  try {
    const query = new URLSearchParams();
    query.append('page', page.toString());
    query.append('per_page', perPage.toString());
    query.append('sort', sort);
    if (search) query.append('search', search);

    const url = `${getApiUrl()}/warga/penukaran-poin/hadiah${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch hadiah (${res.status})`);
    }

    const json = await res.json();
    return {
      data: json.data || [],
      pagination: json.pagination || {},
    };
  } catch (err) {
    console.warn('Error fetching daftar hadiah:', err);
    return {
      data: [],
      pagination: { current_page: 1, total: 0, per_page: 12, last_page: 1, from: 0, to: 0 },
    };
  }
}

export async function fetchSaldoPoin(): Promise<SaldoResponse> {
  try {
    const url = `${getApiUrl()}/warga/penukaran-poin/saldo`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch saldo (${res.status})`);
    }

    const json = await res.json();
    return json.data || { saldo_poin: 0 };
  } catch (err) {
    console.warn('Error fetching saldo poin:', err);
    return { saldo_poin: 0 };
  }
}

export async function tukarPoin(voucherId: number): Promise<{ success: boolean; data?: TukarResponse; error?: string }> {
  try {
    const url = `${getApiUrl()}/warga/penukaran-poin/tukar`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        voucher_id: voucherId,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Gagal melakukan penukaran poin',
      };
    }

    return {
      success: true,
      data: json.data,
    };
  } catch (err) {
    console.warn('Error tukar poin:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan saat melakukan penukaran',
    };
  }
}

export async function fetchRiwayatPenukaran(
  page: number = 1,
  perPage: number = 10,
  sort: string = 'terbaru'
): Promise<RiwayatResponse> {
  try {
    const query = new URLSearchParams();
    query.append('page', page.toString());
    query.append('per_page', perPage.toString());
    query.append('sort', sort);

    const url = `${getApiUrl()}/warga/penukaran-poin/riwayat${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch riwayat (${res.status})`);
    }

    const json = await res.json();
    return {
      data: json.data || [],
      pagination: json.pagination || {},
    };
  } catch (err) {
    console.warn('Error fetching riwayat penukaran:', err);
    return {
      data: [],
      pagination: { current_page: 1, total: 0, per_page: 10, last_page: 1, from: 0, to: 0 },
    };
  }
}
