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
      } catch (e) {}
      throw new Error(msg);
    }
    
    // Auto login after signup by delegating to login
    await useAuthStore.getState().login(email, password);
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ token: null, user: null });
  }
}))
