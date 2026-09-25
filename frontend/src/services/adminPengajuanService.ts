export interface Warga {
  warga_id: number;
  nama_warga: string;
  no_telepon: string;
  alamat: string;
}

export interface JenisSampah {
  jenis_sampah_id: number;
  nama_jenis_sampah: string;
  satuan: string;
  keterangan?: string;
}

export interface DetailPengajuan {
  detail_pengajuan_id: number;
  jenis_sampah_id: number;
  perkiraan_berat: number;
  jenis_sampah?: JenisSampah;
}

export interface JadwalPenjemputan {
  jadwal_id: number;
  petugas_id: number;
  tanggal_penjemputan: string;
  waktu_penjemputan: string;
  status_jadwal: string;
  catatan?: string;
  petugas?: {
    petugas_id: number;
    nama_petugas: string;
    no_telepon: string;
  };
}

export interface PengajuanPenjemputan {
  pengajuan_id: number;
  warga_id: number;
  tanggal_pengajuan: string;
  alamat_penjemputan: string;
  perkiraan_total_berat: number;
  status_pengajuan: 'diajukan' | 'dijadwalkan' | 'diproses' | 'selesai' | 'dibatalkan' | 'ditolak';
  catatan?: string;
  warga?: Warga;
  detailPengajuanSampah?: DetailPengajuan[];
  jadwalPenjemputan?: JadwalPenjemputan;
}

export interface Petugas {
  petugas_id: number;
  nama_petugas: string;
  no_telepon: string;
  alamat?: string;
  status?: string;
}

export interface JadwalPayload {
  petugas_id: number;
  tanggal_penjemputan: string;
  waktu_penjemputan: string;
  catatan?: string;
}

function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('trashure_token') : null;
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function normalizePengajuan(raw: any): PengajuanPenjemputan {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    ...raw,
    detailPengajuanSampah: raw.detailPengajuanSampah ?? raw.detail_pengajuan_sampah ?? [],
    jadwalPenjemputan: raw.jadwalPenjemputan ?? raw.jadwal_penjemputan ?? undefined,
  };
}

export async function fetchPengajuanList(): Promise<PengajuanPenjemputan[]> {
  try {
    const res = await fetch(`${getApiUrl()}/admin/pengajuan`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch pengajuan list (${res.status})`);
    }
    const json = await res.json();
    const rows = json.data || [];
    return Array.isArray(rows) ? rows.map(normalizePengajuan) : [];
  } catch (err) {
    console.error('Error fetching pengajuan list:', err);
    throw err;
  }
}

export async function fetchPengajuanDetail(id: number): Promise<PengajuanPenjemputan> {
  try {
    const res = await fetch(`${getApiUrl()}/admin/pengajuan/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch pengajuan detail (${res.status})`);
    }
    const json = await res.json();
    return normalizePengajuan(json.data);
  } catch (err) {
    console.error('Error fetching pengajuan detail:', err);
    throw err;
  }
}

export async function fetchPetugasList(): Promise<Petugas[]> {
  try {
    const res = await fetch(`${getApiUrl()}/admin/petugas`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch petugas list (${res.status})`);
    }
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Error fetching petugas list:', err);
    throw err;
  }
}

export async function jadwalkanPenjemputan(
  pengajuanId: number,
  payload: JadwalPayload
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/admin/pengajuan/${pengajuanId}/jadwal`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      let errorMsg = json.message || 'Gagal menjadwalkan penjemputan.';
      if (json.errors && typeof json.errors === 'object') {
        const detailed = Object.values(json.errors).flat().join(', ');
        if (detailed) errorMsg = detailed;
      }
      return {
        success: false,
        message: errorMsg,
      };
    }

    return {
      success: true,
      data: json.data,
      message: json.message || 'Penjemputan berhasil dijadwalkan.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Terjadi kendala jaringan saat menjadwalkan penjemputan.',
    };
  }
}
