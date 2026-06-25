import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginCredentials, SignupCredentials, ResetPasswordData } from '../types';

const BASE_URL = process.env.REACT_APP_MAIN_BACKEND;
const API_BASE = `${BASE_URL}/api/admin`;

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  validateResetCode: (email: string, otp: string) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setLoading: (isLoading: boolean) => set({ isLoading }),
      
      setUser: (user: User | null) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }

          const user: User = {
            id: data.data.admin.id,
            email: data.data.admin.email,
            name: data.data.admin.name,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.data.admin.email}`,
          };

          set({
            user,
            token: data.token,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (credentials: SignupCredentials) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE}/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: credentials.name,
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
          }

          // Signup successful, but don't set user state - redirect to login
        } catch (error) {
          console.error('Signup failed:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          const token = useAuthStore.getState().token;
          const response = await fetch(`${API_BASE}/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Logout failed');
          }

          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        } catch (error) {
          console.error('Logout failed:', error);
          // Even if logout fails, clear local state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE}/forgot-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to send reset code');
          }
        } catch (error) {
          console.error('Forgot password failed:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      validateResetCode: async (email: string, otp: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE}/validate-reset-code`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Invalid or expired OTP');
          }
        } catch (error) {
          console.error('Validate reset code failed:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      resetPassword: async (data: ResetPasswordData) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE}/reset-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: data.email,
              otp: data.otp,
              newPassword: data.newPassword,
            }),
          });

          const responseData = await response.json();

          if (!response.ok) {
            throw new Error(responseData.message || 'Password reset failed');
          }
        } catch (error) {
          console.error('Reset password failed:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'auth-store',
      partialize: (state: AuthStore) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
