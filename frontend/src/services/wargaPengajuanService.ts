export interface JenisSampahItem {
  jenis_sampah_id: number;
  nama_jenis_sampah: string;
  satuan: string;
  keterangan: string | null;
  status: string;
  kategori?: string;
}

export interface DetailSampahInput {
  jenis_sampah_id: number;
  nama_jenis_sampah: string;
  keterangan?: string | null;
  perkiraan_berat: number;
  satuan: string;
}

export interface CreatePengajuanPayload {
  alamat_penjemputan: string;
  perkiraan_total_berat: number;
  catatan?: string | null;
  detail_sampah: {
    jenis_sampah_id: number;
    perkiraan_berat: number;
  }[];
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  warga?: {
    warga_id: number;
    nik?: string;
    nama_warga: string;
    jenis_kelamin?: string;
    alamat: string;
    no_telepon: string;
  };
}

export interface PengajuanItem {
  pengajuan_id: number;
  warga_id: number;
  tanggal_pengajuan: string;
  alamat_penjemputan: string;
  perkiraan_total_berat: number;
  catatan?: string | null;
  status_pengajuan: 'diajukan' | 'dijadwalkan' | 'diproses' | 'selesai' | 'dibatalkan' | 'ditolak';
  detail_pengajuan_sampah?: {
    detail_pengajuan_id: number;
    jenis_sampah_id: number;
    perkiraan_berat: number;
    jenis_sampah?: JenisSampahItem;
  }[];
}

export const FALLBACK_JENIS_SAMPAH: JenisSampahItem[] = [
  {
    jenis_sampah_id: 24,
    nama_jenis_sampah: 'Botol Plastik',
    satuan: 'kg',
    keterangan: 'Contoh: botol air mineral, botol minuman',
    status: 'aktif',
    kategori: 'Plastik',
  },
  {
    jenis_sampah_id: 27,
    nama_jenis_sampah: 'Kardus',
    satuan: 'kg',
    keterangan: 'Contoh: kertas, kardus, koran',
    status: 'aktif',
    kategori: 'Kertas',
  },
  {
    jenis_sampah_id: 30,
    nama_jenis_sampah: 'Aluminium',
    satuan: 'kg',
    keterangan: 'Contoh: kaleng minuman, peralatan aluminium',
    status: 'aktif',
    kategori: 'Logam',
  },
  {
    jenis_sampah_id: 26,
    nama_jenis_sampah: 'Kresek / Plastik PE',
    satuan: 'kg',
    keterangan: 'Contoh: kantong kresek, plastik kemasan',
    status: 'aktif',
    kategori: 'Plastik',
  },
  {
    jenis_sampah_id: 13,
    nama_jenis_sampah: 'Besi',
    satuan: 'kg',
    keterangan: 'Contoh: paku, rangka besi tua',
    status: 'aktif',
    kategori: 'Logam',
  },
  {
    jenis_sampah_id: 14,
    nama_jenis_sampah: 'Kaca Bening',
    satuan: 'kg',
    keterangan: 'Contoh: botol kaca, toples bening',
    status: 'aktif',
    kategori: 'Kaca',
  },
];

export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
}

export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('trashure_token') : null;
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchJenisSampah(): Promise<JenisSampahItem[]> {
  try {
    const res = await fetch(`${getApiUrl()}/warga/jenis-sampah`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch jenis sampah (${res.status})`);
    }
    const json = await res.json();
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
    return FALLBACK_JENIS_SAMPAH;
  } catch (err) {
    console.warn('Using fallback jenis sampah due to error:', err);
    return FALLBACK_JENIS_SAMPAH;
  }
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${getApiUrl()}/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.user || null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

export async function createPengajuan(
  payload: CreatePengajuanPayload
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/warga/pengajuan`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      let errorMsg = json.message || 'Gagal membuat pengajuan penjemputan.';
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
      message: json.message || 'Pengajuan penjemputan berhasil dibuat.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Terjadi kendala jaringan saat mengirim pengajuan.',
    };
  }
}

export async function fetchRiwayatPengajuan(): Promise<PengajuanItem[]> {
  try {
    const res = await fetch(`${getApiUrl()}/warga/pengajuan`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Error fetching riwayat pengajuan:', err);
    return [];
  }
}

export async function cancelPengajuan(
  id: number,
  alasan?: string
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/warga/pengajuan/${id}/cancel`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        alasan_pembatalan: alasan?.trim() || undefined,
        catatan: alasan?.trim() || undefined,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      const errorMsg =
        json.errors?.alasan_pembatalan?.[0] ||
        json.errors?.catatan?.[0] ||
        json.message ||
        'Gagal membatalkan pengajuan.';
      return {
        success: false,
        message: errorMsg,
      };
    }
    return {
      success: true,
      data: json.data,
      message: json.message || 'Pengajuan penjemputan berhasil dibatalkan.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Terjadi kendala jaringan saat membatalkan pengajuan.',
    };
  }
}
