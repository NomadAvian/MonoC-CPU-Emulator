import { create } from 'zustand'

const API_URL = 'http://localhost:8000'

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('auth_user')) || null,
  token: localStorage.getItem('auth_token') || null,

  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error("Invalid credentials");
    const data = await res.json();
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify({ username: data.username }));
    set({ token: data.token, user: { username: data.username } });
  },

  signup: async (username, email, password) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    if (!res.ok) {
      let msg = "Signup failed";
      try {
        const errorData = await res.json();
        msg = errorData.detail || msg;
      } catch (e) {
        console.warn('Failed to parse error response as JSON:', e)
      }
      throw new Error(msg);
    }
    
    // Auto login after signup by delegating to login
    await useAuthStore.getState().login(email, password);
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ token: null, user: null });
  },

  saveCode: async (name, code) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error("Must be logged in to save code");
    const res = await fetch(`${API_URL}/user/codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, name, code })
    });
    if (res.status === 401) {
      useAuthStore.getState().logout();
      throw new Error("Session expired. Please log in again.");
    }
    if (!res.ok) throw new Error("Failed to save code");
  },

  fetchSavedCodes: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return [];
    const res = await fetch(`${API_URL}/user/codes?token=${encodeURIComponent(token)}`);
    if (res.status === 401) {
      useAuthStore.getState().logout();
      return [];
    }
    if (!res.ok) throw new Error("Failed to fetch codes");
    const data = await res.json();
    return data.codes || [];
  },

  deleteCode: async (id) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error("Must be logged in to delete code");
    const res = await fetch(`${API_URL}/user/codes/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, id })
    });
    if (res.status === 401) {
      useAuthStore.getState().logout();
      throw new Error("Session expired. Please log in again.");
    }
    if (!res.ok) throw new Error("Failed to delete code");
  }
}))
