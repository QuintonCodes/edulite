import { API_BASE } from '@/utils/constants';
import type { LoginResponse, RegisterInput, RegisterResponse, User } from '@/utils/types';
import axios, { isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const authService = {
  async register(data: RegisterInput): Promise<{ user?: User; error?: string }> {
    try {
      const res = await axios.post<RegisterResponse>(`${API_BASE}/auth/register`, data);
      return { user: res.data.user };
    } catch (error: any) {
      const message = isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : (error.message ?? 'Registration failed');
      return { error: message };
    }
  },

  async login(email: string, password: string): Promise<{ user?: User; error?: string }> {
    try {
      const res = await axios.post<LoginResponse>(`${API_BASE}/auth/login`, { email, password });
      const { accessToken, user } = res.data;

      await SecureStore.setItemAsync('accessToken', accessToken);
      return { user };
    } catch (error: any) {
      const message = isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : (error.message ?? 'Login failed');
      return { error: message };
    }
  },

  async verify(email: string, code: string): Promise<{ user?: User; error?: string }> {
    try {
      const res = await axios.post(`${API_BASE}/auth/verify`, { email, code });
      const { user, accessToken, refreshToken } = res.data;

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);

      return { user };
    } catch (error: any) {
      const message = isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : (error.message ?? 'Verification failed');
      return { error: message };
    }
  },

  async resend(email: string): Promise<{ success?: boolean; error?: string }> {
    try {
      await axios.post(`${API_BASE}/auth/resend-otp`, { email });
      return { success: true };
    } catch (error: any) {
      const message = isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : (error.message ?? 'Failed to resend code');
      return { error: message };
    }
  },

  async logout(): Promise<{ success?: boolean; error?: string }> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (!refreshToken) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return { success: true };
      }

      await axios.post(`${API_BASE}/auth/logout`, { refreshToken });

      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');

      return { success: true };
    } catch (error: any) {
      const message = isAxiosError(error)
        ? (error.response?.data?.error ?? error.message)
        : (error.message ?? 'Logout failed');

      // still clear tokens on failure to ensure local cleanup
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');

      return { error: message };
    }
  },
};
