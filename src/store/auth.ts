import { create } from 'zustand';
import { authAPI } from '@/lib/api';
import type { User } from '@/types/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  token: null,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
  
  login: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },
  
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    
    try {
      const { user } = await authAPI.getMe();
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
