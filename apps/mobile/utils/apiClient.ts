import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

import { ACCESS_KEY, API_BASE, REFRESH_KEY } from './constants';

export async function getAccessToken() {
  return await SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken() {
  return await SecureStore.getItemAsync(REFRESH_KEY);
}

export async function apiFetch(input: string, config: AxiosRequestConfig = {}) {
  const access = await getAccessToken();

  const headers: Record<string, string> = {
    ...(config.headers as Record<string, string>),
    'Content-Type': 'application/json',
  };

  if (access) headers['Authorization'] = `Bearer ${access}`;

  try {
    const response = await axios.request({
      url: `${API_BASE}${input}`,
      method: config.method ?? 'GET',
      ...config,
      headers,
    });

    return response;
  } catch (error) {
    const axiosError = error as AxiosError;

    if (axiosError.response?.status === 401) {
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        await SecureStore.deleteItemAsync(ACCESS_KEY);
        throw error;
      }

      try {
        const refreshResponse = await axios.post<{ accessToken: string; refreshToken?: string }>(
          `${API_BASE}/auth/refresh`,
          { refreshToken },
        );

        const data = refreshResponse.data;
        if (data.accessToken) {
          await SecureStore.setItemAsync(ACCESS_KEY, data.accessToken);
          if (data.refreshToken) await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken);

          // Retry original request
          headers['Authorization'] = `Bearer ${data.accessToken}`;

          const retryResponse = await axios.request({
            url: `${API_BASE}${input}`,
            method: config.method ?? 'GET',
            ...config,
            headers,
          });

          return retryResponse;
        }

        throw new Error('Refresh endpoint did not return access token');
      } catch (refreshError) {
        const refreshAxiosError = refreshError as AxiosError;
        if (refreshAxiosError.response?.status === 401) {
          await SecureStore.deleteItemAsync(ACCESS_KEY);
          await SecureStore.deleteItemAsync(REFRESH_KEY);
        } else {
          console.error('Unexpected token refresh error:', refreshError);
        }
        throw refreshError;
      }
    }

    throw error;
  }
}
