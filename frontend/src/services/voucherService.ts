import { StatusVoucher, VoucherFormData, VoucherItem } from '@/types/voucher';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface RawVoucherRow {
  voucher_id: number;
  nama_voucher: string;
  deskripsi?: string | null;
  poin_dibutuhkan: number;
  jumlah_tersedia: number;
  total_ditukar?: number;
  status: StatusVoucher;
  created_at?: string;
  updated_at?: string;
}

interface ApiSuccessResponse {
  message?: string;
  data?: Record<string, unknown>;
}

interface ApiErrorResponse {
  message?: string;
}

export async function getAdminToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('trashure_token');
  if (token) return token;

  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        login: 'admin@trashure.test',
        password: 'password',
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('trashure_token', data.token);
        localStorage.setItem('trashure_user', JSON.stringify(data.user));
        return data.token;
      }
    }
  } catch (err) {
    console.warn('Auto admin login failed:', err);
  }
  return null;
}

function mapVoucher(row: RawVoucherRow): VoucherItem {
  return {
    id: row.voucher_id,
    namaVoucher: row.nama_voucher,
    deskripsi: row.deskripsi ?? '',
    poinDibutuhkan: Number(row.poin_dibutuhkan) || 0,
    jumlahTersedia: Number(row.jumlah_tersedia) || 0,
    totalDitukar: Number(row.total_ditukar) || 0,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function formatPoin(val: number): string {
  return val.toLocaleString('id-ID');
}

export async function getVouchersFromDB(params?: {
  search?: string;
  status?: string;
  per_page?: number;
}): Promise<{ items: VoucherItem[]; total: number }> {
  const token = await getAdminToken();
  const headers: HeadersInit = {
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.status) query.append('status', params.status);
  query.append('per_page', String(params?.per_page || 100));

  const res = await fetch(`${API_BASE_URL}/admin/voucher?${query.toString()}`, {
    headers,
  });

  if (!res.ok) {
    throw new Error('Gagal mengambil data voucher dari database.');
  }

  const json = await res.json();
  const paginated = json.data;
  const rawList: RawVoucherRow[] = Array.isArray(paginated?.data)
    ? paginated.data
    : Array.isArray(paginated)
      ? paginated
      : [];

  return {
    items: rawList.map(mapVoucher),
    total: paginated?.total ?? rawList.length,
  };
}

export async function createVoucherInDB(payload: VoucherFormData): Promise<Record<string, unknown>> {
  const token = await getAdminToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/admin/voucher`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      nama_voucher: payload.namaVoucher,
      deskripsi: payload.deskripsi || null,
      poin_dibutuhkan: Number(payload.poinDibutuhkan) || 0,
      jumlah_tersedia: Number(payload.jumlahTersedia) || 0,
      status: payload.status,
    }),
  });

  const json: ApiSuccessResponse = await res.json();
  if (!res.ok) {
    throw new Error((json as ApiErrorResponse).message || 'Gagal menambahkan voucher ke database.');
  }
  return json.data ?? {};
}

export async function updateVoucherInDB(
  voucherId: number | string,
  payload: VoucherFormData
): Promise<Record<string, unknown>> {
  const token = await getAdminToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/admin/voucher/${voucherId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      nama_voucher: payload.namaVoucher,
      deskripsi: payload.deskripsi || null,
      poin_dibutuhkan: Number(payload.poinDibutuhkan) || 0,
      jumlah_tersedia: Number(payload.jumlahTersedia) || 0,
      status: payload.status,
    }),
  });

  const json: ApiSuccessResponse = await res.json();
  if (!res.ok) {
    throw new Error((json as ApiErrorResponse).message || 'Gagal memperbarui voucher di database.');
  }
  return json.data ?? {};
}

export async function deleteVoucherFromDB(voucherId: number | string): Promise<{ message: string }> {
  const token = await getAdminToken();
  const headers: HeadersInit = {
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/admin/voucher/${voucherId}`, {
    method: 'DELETE',
    headers,
  });

  const json: { message?: string } = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Gagal menghapus voucher dari database.');
  }
  return { message: json.message || 'Data voucher berhasil dihapus.' };
}

export function labelStatus(status: StatusVoucher): string {
  switch (status) {
    case 'tersedia':
      return 'Tersedia';
    case 'habis':
      return 'Habis';
    case 'tidak_aktif':
      return 'Tidak Aktif';
    default:
      return status;
  }
}