import { PengepulFormData, PengepulItem, PengepulUpdateData, PengepulUser, StatusUser } from '@/types/pengepul';
import { apiFetch } from '@/lib/api';

interface PengepulPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface RawPengepulRow {
  pengepul_id: number;
  user_id: number;
  nama_pengepul: string;
  alamat?: string | null;
  no_telepon?: string | null;
  user?: RawPengepulUser;
  created_at?: string;
  updated_at?: string;
}

interface RawPengepulUser {
  id: number;
  username: string;
  email: string;
  role: string;
  status?: StatusUser;
}

interface ApiSuccessResponse {
  message?: string;
  data?: Record<string, unknown>;
}

interface ApiErrorResponse {
  message?: string;
}

export function terjemahkanErrorPengepul(pesan?: string, fallback = 'Terjadi kesalahan. Silakan periksa kembali data yang dimasukkan.'): string {
  if (!pesan) return fallback;
  const p = pesan.trim();
  if (/the given data was invalid/i.test(p)) return 'Data yang dimasukkan tidak valid. Silakan periksa kembali isian Anda.';
  if (/failed to fetch|networkerror|network request failed/i.test(p)) return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
  if (/unauthenticated/i.test(p)) return 'Sesi Anda telah berakhir. Silakan masuk kembali.';
  if (/no query results for model/i.test(p)) return 'Data tidak ditemukan.';
  if (/^the .* (field|must|is|has|should)/i.test(p)) return 'Data yang dimasukkan tidak valid. Silakan periksa kembali isian Anda.';
  return p;
}

function ambilPesanError(json: Record<string, unknown>, fallback: string): string {
  const errors = (json.errors ?? null) as Record<string, string[]> | null;
  if (errors) {
    const pertama = Object.values(errors).flat().filter(Boolean)[0];
    if (pertama) return terjemahkanErrorPengepul(pertama);
  }
  return terjemahkanErrorPengepul((json.message as string | undefined) || '', fallback);
}

export async function getAdminToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('trashure_token');
}

function mapUser(row: RawPengepulUser): PengepulUser {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role,
    status: row.status ?? 'aktif',
  };
}

function mapPengepul(row: RawPengepulRow): PengepulItem {
  return {
    id: row.pengepul_id,
    pengepulId: row.pengepul_id,
    userId: row.user_id,
    namaPengepul: row.nama_pengepul,
    alamat: row.alamat ?? '',
    noTelepon: row.no_telepon ?? '',
    user: row.user ? mapUser(row.user) : { id: row.user_id, username: '', email: '', role: 'pengepul', status: 'aktif' },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPengepulFromDB(params?: {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}): Promise<{ items: PengepulItem[]; pagination: PengepulPagination }> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.status) query.append('status', params.status);
  if (params?.page) query.append('page', String(params.page));
  query.append('per_page', String(params?.per_page || 10));

  const res = await apiFetch(`/admin/pengepul?${query.toString()}`);

  if (!res.ok) {
    throw new Error('Gagal mengambil data pengepul dari database.');
  }

  const json = await res.json();
  const rawList: RawPengepulRow[] = Array.isArray(json.data)
    ? json.data
    : Array.isArray((json.data as Record<string, unknown>)?.data)
      ? ((json.data as Record<string, unknown>).data as RawPengepulRow[])
      : [];

  const meta = (json.meta ?? {}) as Partial<PengepulPagination>;

  return {
    items: rawList.map(mapPengepul),
    pagination: {
      current_page: meta.current_page ?? 1,
      last_page: meta.last_page ?? 1,
      per_page: meta.per_page ?? 10,
      total: meta.total ?? rawList.length,
    },
  };
}

export async function createPengepulInDB(
  payload: PengepulFormData
): Promise<Record<string, unknown>> {
  const res = await apiFetch('/admin/pengepul', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: payload.username,
      email: payload.email,
      password: payload.password,
      nama_pengepul: payload.namaPengepul,
      alamat: payload.alamat || null,
      no_telepon: payload.noTelepon || null,
    }),
  });

  const json: ApiSuccessResponse = await res.json();
  if (!res.ok) {
    throw new Error(ambilPesanError(json as unknown as Record<string, unknown>, 'Gagal menambahkan pengepul ke database.'));
  }
  return json.data ?? {};
}

export async function updatePengepulInDB(
  pengepulId: number | string,
  payload: PengepulUpdateData
): Promise<Record<string, unknown>> {
  const body: Record<string, string | null> = {
    nama_pengepul: payload.namaPengepul,
    alamat: payload.alamat || null,
    no_telepon: payload.noTelepon || null,
  };
  if (payload.username) body.username = payload.username;
  if (payload.email) body.email = payload.email;
  if (payload.password) body.password = payload.password;
  if (payload.status) body.status = payload.status;

  const res = await apiFetch(`/admin/pengepul/${pengepulId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json: ApiSuccessResponse = await res.json();
  if (!res.ok) {
    throw new Error(ambilPesanError(json as unknown as Record<string, unknown>, 'Gagal memperbarui pengepul di database.'));
  }
  return json.data ?? {};
}

export async function deletePengepulFromDB(
  pengepulId: number | string
): Promise<{ message: string }> {
  const res = await apiFetch(`/admin/pengepul/${pengepulId}`, {
    method: 'DELETE',
  });

  const json: { message?: string } = await res.json();
  if (!res.ok) {
    throw new Error(terjemahkanErrorPengepul(json.message, 'Gagal menghapus pengepul dari database.'));
  }
  return { message: json.message || 'Data pengepul berhasil dihapus.' };
}