import { getAuthHeaders, getApiUrl } from './wargaPengajuanService';

export interface DetailSampahItem {
  jenis_sampah: string;
  perkiraan_berat: number;
  satuan: string;
}

export interface JadwalHariIni {
  jadwal_id: number;
  tanggal_penjemputan: string;
  waktu_penjemputan: string;
  status_jadwal: string;
  nama_warga: string;
  alamat_penjemputan: string;
  no_telepon: string;
  perkiraan_total_berat: number;
  detail_sampah: DetailSampahItem[];
}

export interface DashboardData {
  penjemputan_hari_ini: number;
  penjemputan_selesai: number;
  penjemputan_menunggu: number;
  total_setoran_dikumpul: number;
  jadwal_hari_ini: JadwalHariIni[];
}

export const DEFAULT_DASHBOARD_DATA: DashboardData = {
  penjemputan_hari_ini: 0,
  penjemputan_selesai: 0,
  penjemputan_menunggu: 0,
  total_setoran_dikumpul: 0,
  jadwal_hari_ini: [],
};

export async function fetchPetugasDashboard(): Promise<DashboardData> {
  try {
    const url = `${getApiUrl()}/petugas/dashboard`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch dashboard (${res.status})`);
    }

    const json = await res.json();
    return json.data || DEFAULT_DASHBOARD_DATA;
  } catch (err) {
    console.warn('Error fetching petugas dashboard:', err);
    return DEFAULT_DASHBOARD_DATA;
  }
}
