const API_BASE = '';

export function getStoredToken() {
  return localStorage.getItem('gpl_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('gpl_token', token);
  } else {
    localStorage.removeItem('gpl_token');
  }
}

export async function apiRequest(path, options = {}) {
  const token = getStoredToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && data.message) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}
