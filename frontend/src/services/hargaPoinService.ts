import { HargaPoinItem, JenisSampahDB, KategoriSampah } from '@/types/harga-poin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper function to detect category based on waste name
export function detectKategori(nama: string): KategoriSampah {
  const lower = nama.toLowerCase();
  if (lower.includes('plastik') || lower.includes('kresek') || lower.includes('galon')) return 'Plastik';
  if (lower.includes('kertas') || lower.includes('kardus') || lower.includes('koran') || lower.includes('karton') || lower.includes('buku')) return 'Kertas';
  if (lower.includes('logam') || lower.includes('besi') || lower.includes('aluminium') || lower.includes('kaleng') || lower.includes('tembaga') || lower.includes('seng')) return 'Logam';
  if (lower.includes('kaca') || lower.includes('botol kaca') || lower.includes('beling')) return 'Kaca';
  if (lower.includes('organik') || lower.includes('daun') || lower.includes('makanan')) return 'Organik';
  return 'Lainnya';
}

// Helper to detect icon based on waste name
export function detectIconType(nama: string): string {
  const lower = nama.toLowerCase();
  if (lower.includes('botol plastik')) return 'botol-plastik';
  if (lower.includes('gelas')) return 'gelas-plastik';
  if (lower.includes('kresek') || lower.includes('kantong')) return 'kresek';
  if (lower.includes('kardus') || lower.includes('box')) return 'kardus';
  if (lower.includes('hvs') || lower.includes('dokumen')) return 'kertas-hvs';
  if (lower.includes('koran')) return 'koran';
  if (lower.includes('aluminium')) return 'aluminium';
  if (lower.includes('kaleng')) return 'kaleng';
  if (lower.includes('besi') || lower.includes('logam') || lower.includes('tembaga')) return 'besi';
  if (lower.includes('kaca bening')) return 'kaca-bening';
  if (lower.includes('kaca warna')) return 'kaca-warna';
  if (lower.includes('kaca pecah') || lower.includes('beling')) return 'kaca-pecah';
  return 'default';
}

// Helper to format date to Indonesian format e.g. "1 Agustus 2024"
export function formatTanggalIndo(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

// Helper to convert "1 Agustus 2024" or Date to "YYYY-MM-DD" for MySQL
export function toMysqlDate(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  try {
    const parts = dateStr.trim().split(' ');
    if (parts.length === 3) {
      const months: Record<string, string> = {
        Januari: '01', Februari: '02', Maret: '03', April: '04',
        Mei: '05', Juni: '06', Juli: '07', Agustus: '08',
        September: '09', Oktober: '10', November: '11', Desember: '12',
      };
      const day = parts[0].padStart(2, '0');
      const month = months[parts[1]] || '01';
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {
    // fallback
  }
  return new Date().toISOString().split('T')[0];
}

// Helper to get or obtain an Admin auth token
export async function getAdminToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  let token = localStorage.getItem('trashure_token');
  if (token) return token;

  // Fallback in local development: auto-login as admin
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

// 1. Fetch Jenis Sampah from Database
export async function getJenisSampahFromDB(): Promise<JenisSampahDB[]> {
  const token = await getAdminToken();
  const headers: HeadersInit = {
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/admin/jenis-sampah`, {
    headers,
  });

  if (!res.ok) {
    throw new Error('Gagal mengambil master jenis sampah dari database.');
  }

  const json = await res.json();
  const rawList = Array.isArray(json.data) ? json.data : [];

  return rawList.map((item: any) => ({
    id: item.jenis_sampah_id,
    nama: item.nama_jenis_sampah,
    satuan: item.satuan || 'Kg',
    kategori: item.kategori || detectKategori(item.nama_jenis_sampah),
    keterangan: item.keterangan || '',
    iconType: detectIconType(item.nama_jenis_sampah),
  }));
}

// 2. Fetch Harga Sampah from Database
export async function getHargaSampahFromDB(params?: {
  search?: string;
  status?: string;
  per_page?: number;
}): Promise<{ items: HargaPoinItem[]; total: number }> {
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

  const res = await fetch(`${API_BASE_URL}/admin/harga-sampah?${query.toString()}`, {
    headers,
  });

  if (!res.ok) {
    throw new Error('Gagal mengambil data harga & poin dari database.');
  }

  const json = await res.json();
  const paginated = json.data;
  const rawList = Array.isArray(paginated?.data) ? paginated.data : Array.isArray(paginated) ? paginated : [];

  const items: HargaPoinItem[] = rawList.map((row: any) => {
    const jenis = row.jenis_sampah || {};
    const namaSampah = jenis.nama_jenis_sampah || 'Sampah';
    const kategori = jenis.kategori || detectKategori(namaSampah);
    const satuan = jenis.satuan || 'Kg';

    return {
      id: row.harga_id,
      jenisSampahId: row.jenis_sampah_id,
      namaJenisSampah: namaSampah,
      kategori,
      satuan,
      hargaPerSatuan: Number(row.harga_per_satuan) || 0,
      nilaiPoinPerSatuan: Number(row.nilai_poin_per_satuan) || 0,
      berlakuMulai: formatTanggalIndo(row.berlaku_mulai),
      berlakuSelesai: row.berlaku_selesai ? formatTanggalIndo(row.berlaku_selesai) : null,
      status: (row.status?.toLowerCase() === 'aktif' ? 'Aktif' : 'Nonaktif') as 'Aktif' | 'Nonaktif',
      keterangan: jenis.keterangan || '',
      iconType: detectIconType(namaSampah),
    };
  });

  return {
    items,
    total: paginated?.total ?? items.length,
  };
}

// 3. Create Harga Sampah in Database
export async function createHargaSampahInDB(payload: {
  jenis_sampah_id: number;
  harga_per_satuan: number;
  nilai_poin_per_satuan: number;
  berlaku_mulai: string;
  berlaku_selesai?: string | null;
  status: string;
}): Promise<any> {
  const token = await getAdminToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/admin/harga-sampah`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jenis_sampah_id: payload.jenis_sampah_id,
      harga_per_satuan: payload.harga_per_satuan,
      nilai_poin_per_satuan: payload.nilai_poin_per_satuan,
      berlaku_mulai: toMysqlDate(payload.berlaku_mulai),
      berlaku_selesai: payload.berlaku_selesai ? toMysqlDate(payload.berlaku_selesai) : null,
      status: payload.status.toLowerCase(),
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Gagal menambahkan tarif harga & poin ke database.');
  }
  return json.data;
}

// 4. Update Harga Sampah in Database
export async function updateHargaSampahInDB(
  hargaId: number | string,
  payload: {
    harga_per_satuan: number;
    nilai_poin_per_satuan: number;
    berlaku_mulai: string;
    berlaku_selesai?: string | null;
    status: string;
  }
): Promise<any> {
  const token = await getAdminToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/admin/harga-sampah/${hargaId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      harga_per_satuan: payload.harga_per_satuan,
      nilai_poin_per_satuan: payload.nilai_poin_per_satuan,
      berlaku_mulai: toMysqlDate(payload.berlaku_mulai),
      berlaku_selesai: payload.berlaku_selesai ? toMysqlDate(payload.berlaku_selesai) : null,
      status: payload.status.toLowerCase(),
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Gagal memperbarui tarif harga di database.');
  }
  return json.data;
}

// 5. Delete Harga Sampah from Database
export async function deleteHargaSampahFromDB(hargaId: number | string): Promise<any> {
  const token = await getAdminToken();
  const headers: HeadersInit = {
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/admin/harga-sampah/${hargaId}`, {
    method: 'DELETE',
    headers,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Gagal menghapus tarif harga dari database.');
  }
  return json;
}
