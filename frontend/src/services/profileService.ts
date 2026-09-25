const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const getAuthHeaders = () => {
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('trashure_token') || '';
    if (!token) {
      const match = document.cookie.match(new RegExp('(^| )trashure_token=([^;]+)'));
      if (match) token = match[2];
    }
  }
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
};

export interface WargaProfileDetail {
  warga_id?: number;
  user_id?: number;
  nik?: string | null;
  nama_warga: string;
  jenis_kelamin?: 'L' | 'P' | string | null;
  alamat?: string | null;
  no_telepon?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PetugasProfileDetail {
  petugas_id?: number;
  user_id?: number;
  nama_petugas: string;
  jenis_kelamin?: 'L' | 'P' | string | null;
  alamat?: string | null;
  no_telepon?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PengepulProfileDetail {
  pengepul_id?: number;
  user_id?: number;
  nama_pengepul: string;
  alamat?: string | null;
  no_telepon?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminProfileDetail {
  admin_id?: number;
  user_id?: number;
  nama_admin: string;
  no_telepon?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CurrentUserProfile {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'petugas' | 'warga' | 'pengepul' | string;
  status: string;
  admin?: AdminProfileDetail;
  warga?: WargaProfileDetail;
  petugas?: PetugasProfileDetail;
  pengepul?: PengepulProfileDetail;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateWargaPayload {
  nama_warga?: string;
  nik?: string;
  jenis_kelamin?: 'L' | 'P' | '';
  no_telepon?: string;
  alamat?: string;
  username?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
}

export interface UpdatePetugasPayload {
  nama_petugas?: string;
  jenis_kelamin?: 'L' | 'P' | '';
  no_telepon?: string;
  alamat?: string;
  username?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
}

export interface UpdatePengepulPayload {
  nama_pengepul?: string;
  no_telepon?: string;
  alamat?: string;
  username?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
}

export interface UpdateAdminPayload {
  nama_admin?: string;
  no_telepon?: string;
  username?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
}

export async function fetchProfile(): Promise<CurrentUserProfile | null> {
  try {
    const res = await fetch(`${getApiUrl()}/me`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.user || null;
  } catch (err) {
    console.error('Error fetching profile:', err);
    return null;
  }
}

export async function updateProfile(
  payload: UpdateWargaPayload | UpdatePetugasPayload | UpdatePengepulPayload | UpdateAdminPayload
): Promise<{ success: boolean; data?: CurrentUserProfile; message?: string; errors?: Record<string, string[]> }> {
  try {
    const res = await fetch(`${getApiUrl()}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
      let message = json.message || 'Gagal memperbarui profil.';
      if (json.errors && typeof json.errors === 'object') {
        const errorEntries = Object.values(json.errors).flat();
        if (errorEntries.length > 0) {
          message = errorEntries[0] as string;
        }
      }
      return {
        success: false,
        message,
        errors: json.errors,
      };
    }

    // Sync updated user info with localStorage
    if (typeof window !== 'undefined' && json.user) {
      try {
        const existing = localStorage.getItem('trashure_user');
        const userObj = existing ? JSON.parse(existing) : {};
        const updatedObj = {
          ...userObj,
          id: json.user.id,
          username: json.user.username,
          email: json.user.email,
          role: json.user.role,
          name: json.user.admin?.nama_admin || json.user.warga?.nama_warga || json.user.petugas?.nama_petugas || json.user.pengepul?.nama_pengepul || json.user.username,
          admin: json.user.admin,
          warga: json.user.warga,
          petugas: json.user.petugas,
          pengepul: json.user.pengepul,
        };
        localStorage.setItem('trashure_user', JSON.stringify(updatedObj));
      } catch (e) {
        console.warn('Could not sync user to localStorage:', e);
      }
    }

    return {
      success: true,
      data: json.user,
      message: json.message || 'Profil berhasil diperbarui.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Terjadi kesalahan jaringan.',
    };
  }
}
