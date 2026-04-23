// Real API Service — Connects to Express backend at localhost:5001
const API_BASE = 'http://localhost:5001/api';

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper to make authenticated requests
const authFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

// ============================================================
// AUTH ENDPOINTS
// ============================================================

export const registerUser = async (userData) => {
  const payload = {
    fullName: userData.fullName,
    studentId: userData.studentId,
    faculty: userData.faculty,
    phoneNo: userData.phoneNo,
    email: userData.email,
    password: userData.password,
  };

  const data = await authFetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return data;
};

export const sendOTPRequest = async (email) => {
  const data = await authFetch(`${API_BASE}/auth/send-otp`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return data;
};

export const verifyOTP = async (email, otp) => {
  const data = await authFetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
  return data;
};

export const loginUser = async (email, password) => {
  const data = await authFetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Store token and user info in localStorage
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
};

export const sendPasswordResetInfo = async (email) => {
  const data = await authFetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const data = await authFetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ email, otp, newPassword }),
  });
  return data;
};

export const getProfile = async () => {
  return authFetch(`${API_BASE}/auth/me`);
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ============================================================
// ADMIN / USER MANAGEMENT ENDPOINTS
// ============================================================

export const getAllUsers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return authFetch(`${API_BASE}/users?${query}`);
};

export const getUserById = async (id) => {
  return authFetch(`${API_BASE}/users/${id}`);
};

export const updateUser = async (id, userData) => {
  return authFetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

export const updateUserStatus = async (id, status) => {
  return authFetch(`${API_BASE}/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

export const deleteUserById = async (id) => {
  return authFetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
  });
};

export const getDashboardStats = async () => {
  return authFetch(`${API_BASE}/users/stats`);
};
