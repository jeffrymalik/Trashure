const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('trashure_token');
}

function clearAuthAndRedirect() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('trashure_token');
  localStorage.removeItem('trashure_user');
  document.cookie = 'trashure_token=; path=/; max-age=0';
  document.cookie = 'trashure_role=; path=/; max-age=0';
  window.location.href = '/';
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (options.headers) {
    const h = options.headers as Record<string, string>;
    Object.keys(h).forEach((k) => { headers[k] = h[k]; });
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearAuthAndRedirect();
    throw new Error('Sesi Anda telah berakhir. Mengalihkan ke halaman login...');
  }

  return res;
}
