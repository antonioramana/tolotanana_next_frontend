const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as any),
  };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

async function apiPublic<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as any),
  };
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

function unwrapList<T>(res: any): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && Array.isArray(res.data)) return res.data as T[];
  return [] as T[];
}

function unwrapObject<T>(res: any): T {
  if (res && typeof res === 'object' && 'data' in res) return res.data as T;
  return res as T;
}

export const AuthApi = {
  login: (data: { email: string; password: string }) =>
    api<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  register: (data: { firstName: string; lastName: string; email: string; password: string; role?: 'demandeur'|'donateur'|'admin'; phone?: string }) =>
    api<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => api<any>('/users/me'),
};

export const CatalogApi = {
  categories: async () => unwrapList<any>(await api<any>('/categories')),
  campaigns: async (query: string = '') => unwrapList<any>(await api<any>(`/campaigns${query ? `?${query}` : ''}`)),
  campaignById: async (id: string) => unwrapObject<any>(await api<any>(`/campaigns/${id}`)),
};

export const CampaignsApi = {
  myCampaigns: async (query: string = '') => {
    const res = await api<any>(`/campaigns/my-campaigns${query ? `?${query}` : ''}`);
    return res; // Return full response with data and meta
  },
  update: (id: string, payload: any) => api<any>(`/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  updateStatus: (id: string, status: string) => api<any>(`/campaigns/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateAdminStatus: (id: string, status: string) => api<any>(`/campaigns/${id}/admin-status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id: string) => api<any>(`/campaigns/${id}`, { method: 'DELETE' }),
  create: (payload: any) => api<any>('/campaigns', { method: 'POST', body: JSON.stringify(payload) }),
  // Campaign Updates
  createUpdate: (campaignId: string, payload: { title: string; content: string }) => api<any>(`/campaigns/${campaignId}/updates`, { method: 'POST', body: JSON.stringify(payload) }),
  getUpdates: (campaignId: string, query: string = '') => api<any>(`/campaigns/${campaignId}/updates${query ? `?${query}` : ''}`),
  updateUpdate: (campaignId: string, updateId: string, payload: { title: string; content: string }) => api<any>(`/campaigns/${campaignId}/updates/${updateId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteUpdate: (campaignId: string, updateId: string) => api<any>(`/campaigns/${campaignId}/updates/${updateId}`, { method: 'DELETE' }),
  
  // Thank You Message
  updateThankYouMessage: (campaignId: string, payload: { thankYouMessage: string }) => api<any>(`/campaigns/${campaignId}/thank-you-message`, { method: 'PATCH', body: JSON.stringify(payload) }),
};

export const DonationsApi = {
  create: (payload: any) => apiPublic<any>('/donations', { method: 'POST', body: JSON.stringify(payload) }),
  list: async (query: string = '') => unwrapList<any>(await api<any>(`/donations${query ? `?${query}` : ''}`)),
  adminUpdate: (id: string, payload: { status?: string }) => api<any>(`/donations/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
};

export const BankApi = {
  list: () => api<any[]>('/bank-info'),
  create: (payload: { type: 'mobile_money'|'bank_account'; accountNumber: string; accountName: string; provider: string; isDefault?: boolean }) =>
    api<any>('/bank-info', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<{ type: 'mobile_money'|'bank_account'; accountNumber: string; accountName: string; provider: string; isDefault: boolean }>) =>
    api<any>(`/bank-info/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id: string) => api<any>(`/bank-info/${id}`, { method: 'DELETE' }),
  setDefault: (id: string) => api<any>(`/bank-info/${id}`, { method: 'PATCH', body: JSON.stringify({ isDefault: true }) }),
  getAdminInfo: () => apiPublic<any[]>('/public/bank-info/admin'),
};

export const CampaignThankYouMessagesApi = {
  list: (campaignId: string) => api<any[]>(`/campaign-thank-you-messages?campaignId=${campaignId}`),
  create: (payload: { campaignId: string; message: string }) =>
    api<any>('/campaign-thank-you-messages', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: { message?: string; isActive?: boolean }) =>
    api<any>(`/campaign-thank-you-messages/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id: string) => api<any>(`/campaign-thank-you-messages/${id}`, { method: 'DELETE' }),
  setActive: (id: string) => api<any>(`/campaign-thank-you-messages/${id}/set-active`, { method: 'PATCH' }),
  getActive: (campaignId: string) => apiPublic<any>(`/public/campaign-thank-you-messages/campaign/${campaignId}/active`),
};

export const UploadApi = {
  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/uploads`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const path = data.url || data.location || '';
    return path.startsWith('http') ? path : `${API_BASE}${path}`;
  },
};

export const StatsApi = {
  dashboard: async (query: string = '') => unwrapObject<any>(await api<any>(`/statistics${query ? `?${query}` : ''}`)),
};

export const WithdrawalsApi = {
  // User withdrawal requests
  myRequests: async (query: string = '') => unwrapObject<any>(await api<any>(`/withdrawal-requests/my-requests${query ? `?${query}` : ''}`)),
  create: async (data: any) => unwrapObject<any>(await api<any>('/withdrawal-requests', { method: 'POST', body: JSON.stringify(data) })),
  update: async (id: string, data: any) => unwrapObject<any>(await api<any>(`/withdrawal-requests/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),
  delete: async (id: string) => unwrapObject<any>(await api<any>(`/withdrawal-requests/${id}`, { method: 'DELETE' })),
  
  // Admin withdrawal requests
  all: async (query: string = '') => unwrapObject<any>(await api<any>(`/withdrawal-requests${query ? `?${query}` : ''}`)),
  updateStatus: async (id: string, data: any) => unwrapObject<any>(await api<any>(`/withdrawal-requests/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) })),
};

export const UsersApi = {
  getProfile: () => api<any>('/users/me'),
  updateProfile: (data: any) => api<any>('/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  getMyDonations: (query: string = '') => api<any>(`/users/donations${query ? `?${query}` : ''}`),
  
  // Admin methods
  getAll: (query: string = '') => api<any>(`/users${query ? `?${query}` : ''}`),
  getById: (id: string) => api<any>(`/users/${id}`),
  update: (id: string, data: any) => api<any>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => api<any>(`/users/${id}`, { method: 'DELETE' }),
};

export const TermsOfServiceApi = {
  create: (payload: { title: string; content: string; version?: string }) => api<any>('/terms-of-service', { method: 'POST', body: JSON.stringify(payload) }),
  list: () => api<any>('/terms-of-service'),
  getActive: () => api<any>('/terms-of-service/active'),
  getById: (id: string) => api<any>(`/terms-of-service/${id}`),
  update: (id: string, payload: { title?: string; content?: string; version?: string }) => api<any>(`/terms-of-service/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  activate: (id: string) => api<any>(`/terms-of-service/${id}/activate`, { method: 'PATCH' }),
  delete: (id: string) => api<any>(`/terms-of-service/${id}`, { method: 'DELETE' }),
};

export { api, apiPublic, getAuthToken, API_BASE };
