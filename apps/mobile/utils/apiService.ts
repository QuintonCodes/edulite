import { API_BASE } from '@/utils/constants';
import type {
  LoginResponse,
  Media,
  PastPaper,
  RegisterInput,
  RegisterResponse,
  User,
  VerifyResponse,
} from '@/utils/types';
import axios, { isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

type MarkCompleteResponse = {
  message: string;
  xpAwarded: number;
  user: User;
};

function handleError(error: any, defaultMessage: string): string {
  if (isAxiosError(error)) {
    // Check for nested error objects (e.g., from Zod)
    const errorData = error.response?.data?.error;
    if (typeof errorData === 'object' && errorData !== null) {
      // Try to get the first validation error
      const firstErrorKey = Object.keys(errorData)[0];
      if (firstErrorKey && Array.isArray(errorData[firstErrorKey])) {
        return errorData[firstErrorKey][0];
      }
    }
    // Fallback to standard error message
    return error.response?.data?.error ?? error.message;
  }
  return error.message ?? defaultMessage;
}

export const authService = {
  async register(data: RegisterInput): Promise<{ user?: User; error?: string }> {
    try {
      const res = await axios.post<RegisterResponse>(`${API_BASE}/auth/register`, data);
      return { user: res.data.user };
    } catch (error: any) {
      return { error: handleError(error, 'Registration failed') };
    }
  },

  async login(email: string, password: string): Promise<{ user?: User; error?: string }> {
    try {
      const res = await axios.post<LoginResponse>(`${API_BASE}/auth/login`, { email, password });
      const { accessToken, refreshToken, user } = res.data;

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);

      return { user };
    } catch (error: any) {
      return { error: handleError(error, 'Login failed') };
    }
  },

  async verify(email: string, code: string): Promise<{ user?: User; error?: string }> {
    try {
      const res = await axios.post<VerifyResponse>(`${API_BASE}/auth/verify-otp`, { email, code });
      const { user, accessToken, refreshToken } = res.data;

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);

      return { user };
    } catch (error: any) {
      return { error: handleError(error, 'Verification failed') };
    }
  },

  async resend(email: string): Promise<{ success?: boolean; error?: string }> {
    try {
      await axios.post<{ message: string }>(`${API_BASE}/auth/resend-otp`, { email });
      return { success: true };
    } catch (error: any) {
      return { error: handleError(error, 'Failed to resend code') };
    }
  },

  async logout(): Promise<{ success?: boolean; error?: string }> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        await axios.post<{ message: string }>(`${API_BASE}/auth/logout`, { refreshToken });
      }
    } catch (error) {
      // We don't return an error, just log it. Logout should always clear local tokens.
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear tokens
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    }
    return { success: true };
  },

  async deleteAccount(userId?: string): Promise<{ success?: boolean; error?: string }> {
    try {
      if (!userId) throw new Error('User ID is required');
      await axios.delete(`${API_BASE}/users/${userId}`);
      // Logout logic after successful deletion
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      return { success: true };
    } catch (error: any) {
      return { error: handleError(error, 'Delete account failed') };
    }
  },
};

export const profileService = {
  async updateAvatar(formData: FormData): Promise<{ avatarUrl?: string; error?: string }> {
    try {
      const res = await axios.post<{ message: string; media: Media }>(`${API_BASE}/media/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { avatarUrl: res.data.media.url };
    } catch (error: any) {
      return { error: handleError(error, 'Avatar upload failed') };
    }
  },

  async updateProfile(data: Partial<User>, userId?: string): Promise<{ user?: User; error?: string }> {
    try {
      const response = await axios.put<{ message: string; user: User }>(`${API_BASE}/users/${userId}`, data);
      return { user: response.data.user };
    } catch (error: any) {
      return { error: handleError(error, 'Profile update failed') };
    }
  },
};

export const uploadService = {
  async uploadPastPaper(formData: FormData): Promise<{ pastPaperUrl?: string; error?: string }> {
    try {
      const res = await axios.post<{ message: string; pastPaper: PastPaper }>(
        `${API_BASE}/past-papers/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return { pastPaperUrl: res.data.pastPaper.url };
    } catch (error: any) {
      return { error: handleError(error, 'Past paper upload failed') };
    }
  },
};

export const progressService = {
  // Get completion status
  getProgress: async (lessonId: string, userId?: string): Promise<{ completed: boolean; error?: string }> => {
    try {
      const res = await axios.get<{ completed: boolean }>(`${API_BASE}/api/progress`, {
        params: { lessonId, userId },
      });
      return { completed: res.data.completed };
    } catch (error) {
      const message = handleError(error, 'Failed to get progress');
      return { completed: false, error: message };
    }
  },

  // Mark as complete and get updated user
  markAsComplete: async (
    lessonId: string,
    userId?: string,
  ): Promise<{ data?: MarkCompleteResponse; error?: string }> => {
    try {
      const res = await axios.post<MarkCompleteResponse>(`${API_BASE}/api/progress`, {
        lessonId,
        userId,
      });
      return { data: res.data };
    } catch (error) {
      const message = handleError(error, 'Failed to mark as complete');
      return { error: message };
    }
  },
};
