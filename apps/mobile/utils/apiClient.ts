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
    if ((error as AxiosError).response?.status === 401) {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) throw error;

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
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw refreshError;
      }
    }

    throw error;
  }
}
