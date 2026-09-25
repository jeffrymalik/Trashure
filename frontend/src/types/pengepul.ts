export type StatusUser = 'aktif' | 'nonaktif';

export interface PengepulUser {
  id: number;
  username: string;
  email: string;
  role: string;
  status: StatusUser;
}

export interface PengepulItem {
  id: number | string;
  pengepulId: number;
  userId: number;
  namaPengepul: string;
  alamat?: string | null;
  noTelepon?: string | null;
  user: PengepulUser;
  createdAt?: string;
  updatedAt?: string;
}

export interface PengepulFormData {
  username: string;
  email: string;
  password?: string;
  namaPengepul: string;
  alamat?: string;
  noTelepon?: string;
}

export interface PengepulUpdateData {
  username?: string;
  email?: string;
  namaPengepul: string;
  alamat?: string;
  noTelepon?: string;
  password?: string;
  status?: StatusUser;
}

export interface FilterState {
  search: string;
  status: string;
}