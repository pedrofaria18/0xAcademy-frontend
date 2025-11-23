import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authAPI } from '@/lib/api';
import type { User } from '@/types/api';

/**
 * Authentication Store with Zustand
 * Manages user authentication state with persistent JWT token
 */

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

/**
 * Zustand store with localStorage persistence for JWT token
 *
 * @important Uses persist middleware to sync token across tabs/windows
 * Storage is only accessed client-side to prevent SSR issues
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      token: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (token) => {
        set({ token });
      },

      login: (user, token) => {
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      logout: async () => {
        try {
          // Call logout API to invalidate token on backend
          await authAPI.logout();
        } catch (error) {
          console.error('Logout API error:', error);
          // Continue with local logout even if API fails
        }

        // Clear all auth state
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },

      checkAuth: async () => {
        const { token } = get();

        if (!token) {
          set({ isLoading: false, isAuthenticated: false, user: null });
          return;
        }

        try {
          // Validate token with backend
          const { user } = await authAPI.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error('Auth validation failed:', error);
          // Token is invalid - clear auth state
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: '0xacademy-auth', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist token (user will be revalidated)
      partialize: (state) => ({ token: state.token }),
      // Rehydration callback
      onRehydrateStorage: () => (state) => {
        // After rehydration, check if token is still valid
        if (state?.token) {
          state.checkAuth();
        } else {
          state?.setToken(null);
        }
      },
    }
  )
);
