import Constants from 'expo-constants';

export const API_BASE = Constants.expoConfig?.extra?.API_BASE;

if (!API_BASE) {
  throw new Error("API_BASE is not configured in app.json's 'extra' field.");
}

export const ACCESS_KEY = 'accessToken';
export const REFRESH_KEY = 'refreshToken';
