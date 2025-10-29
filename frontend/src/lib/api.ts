// API configuration and helper functions
// Use relative path so Nginx proxy handles the routing
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Set auth token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('current_user');
  return userStr ? JSON.parse(userStr) : null;
};

// Set current user in localStorage
export const setCurrentUser = (user: any): void => {
  localStorage.setItem('current_user', JSON.stringify(user));
};

// Remove current user from localStorage
export const removeCurrentUser = (): void => {
  localStorage.removeItem('current_user');
};

// Generic API request function
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),
  
  resetPassword: (userId: number, newPassword: string) =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, new_password: newPassword }),
    }),
};

// Users API
export const usersAPI = {
  getAll: () => apiRequest<any[]>('/users'),
  getById: (id: number) => apiRequest<any>(`/users/${id}`),
  create: (data: any) => apiRequest('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => apiRequest(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
};

// Companies API
export const companiesAPI = {
  getAll: () => apiRequest<any[]>('/companies'),
  getById: (id: number) => apiRequest<any>(`/companies/${id}`),
  create: (data: any) => apiRequest('/companies', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => apiRequest(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiRequest(`/companies/${id}`, { method: 'DELETE' }),
};

// Deals API
export const dealsAPI = {
  getAll: () => apiRequest<any[]>('/deals'),
  getById: (id: number) => apiRequest<any>(`/deals/${id}`),
  create: (data: any) => apiRequest('/deals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => apiRequest(`/deals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiRequest(`/deals/${id}`, { method: 'DELETE' }),
};

// Targets API
export const targetsAPI = {
  getAll: () => apiRequest<any[]>('/targets'),
  getById: (id: number) => apiRequest<any>(`/targets/${id}`),
  create: (data: any) => apiRequest('/targets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => apiRequest(`/targets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => apiRequest(`/targets/${id}`, { method: 'DELETE' }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => apiRequest<any>('/analytics/dashboard'),
  getPartnerPerformance: (companyId?: number) => 
    apiRequest<any>(`/analytics/partner-performance${companyId ? `?company_id=${companyId}` : ''}`),
};

// Payouts API
export const payoutsAPI = {
  getAll: () => apiRequest<any[]>('/payouts'),
  getById: (id: number) => apiRequest<any>(`/payouts/${id}`),
  calculate: () => apiRequest('/payouts/calculate', { method: 'POST' }),
  approve: (id: number) => apiRequest(`/payouts/${id}/approve`, { method: 'POST' }),
  reject: (id: number) => apiRequest(`/payouts/${id}/reject`, { method: 'POST' }),
};

