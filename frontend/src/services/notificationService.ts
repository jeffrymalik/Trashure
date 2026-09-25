import { getAuthHeaders, getApiUrl } from './wargaPengajuanService';

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  message: string;
  data: NotificationItem[];
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

export interface UnreadCountResponse {
  unread_count: number;
}

export async function fetchNotifications(page: number = 1, perPage: number = 20): Promise<NotificationsResponse> {
  const res = await fetch(`${getApiUrl()}/notifications?page=${page}&per_page=${perPage}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Gagal memuat notifikasi');
  return res.json();
}

export async function fetchUnreadCount(): Promise<UnreadCountResponse> {
  const res = await fetch(`${getApiUrl()}/notifications/unread-count`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Gagal memuat jumlah notifikasi');
  return res.json();
}

export async function markAsRead(id: number): Promise<void> {
  await fetch(`${getApiUrl()}/notifications/${id}/read`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
}

export async function markAllAsRead(): Promise<void> {
  await fetch(`${getApiUrl()}/notifications/read-all`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
}
