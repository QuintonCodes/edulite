import { useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { useSessionQuery } from '@/hooks/useSession';
import { API_BASE } from '@/utils/constants';
import type { LoginResponse, RegisterInput, RegisterResponse, User } from '@/utils/types';

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user?: User | null) => void;
  logout: () => Promise<void>;
  updateUser: (user?: Partial<User> | ((prev: User) => Partial<User>)) => void;
  refreshSession: () => Promise<void>;
  register: (data: RegisterInput) => Promise<{ user?: User; error?: string }>;
  login: (email: string, password: string) => Promise<{ user?: User; error?: string }>;
};

const secureStorage = {
  getItem: async (name: string) => await SecureStore.getItemAsync(name),
  setItem: async (name: string, value: string) => await SecureStore.setItemAsync(name, value),
  removeItem: async (name: string) => await SecureStore.deleteItemAsync(name),
};

const AuthContext = createContext<StoreApi<AuthStore> | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const [store] = useState(() =>
    createStore<AuthStore>()(
      persist(
        (set, get) => ({
          user: null,
          isAuthenticated: false,
          isLoading: true,

          setUser: (user) => {
            set({
              user: user ?? null,
              isAuthenticated: !!user,
              isLoading: false,
            });
          },

          logout: async () => {
            try {
              await axios.post(`${API_BASE}/auth/logout`);
            } finally {
              set({ user: null, isAuthenticated: false, isLoading: false });

              // Invalidate the session query so it re-fetches
              get().refreshSession();
            }
          },

          updateUser: (user) => {
            const currentUser = get().user;
            if (!currentUser) return;

            const updatedUser = typeof user === 'function' ? user(currentUser) : user;
            set({ user: { ...currentUser, ...updatedUser } });
          },

          refreshSession: async () => {
            await queryClient.invalidateQueries({ queryKey: ['session'] });
          },

          register: async (data) => {
            set({ isLoading: true });
            try {
              const res = await axios.post<RegisterResponse>(`${API_BASE}/auth/register`, data);
              const { user } = res.data;

              set({ user, isAuthenticated: true, isLoading: false });
              return { user };
            } catch (error: any) {
              set({ isLoading: false });
              const message = isAxiosError(error)
                ? ((error.response?.data?.error as string | undefined) ?? error.message)
                : error instanceof Error
                  ? error.message
                  : 'Registration failed';
              return { error: message };
            }
          },

          login: async (email, password) => {
            set({ isLoading: true });
            try {
              const res = await axios.post<LoginResponse>(`${API_BASE}/auth/login`, { email, password });
              const { user, accessToken } = res.data;

              await SecureStore.setItemAsync('accessToken', accessToken);
              set({ user, isAuthenticated: true, isLoading: false });
              return { user };
            } catch (error: any) {
              set({ isLoading: false });
              const message = isAxiosError(error)
                ? ((error.response?.data?.error as string | undefined) ?? error.message)
                : error instanceof Error
                  ? error.message
                  : 'Login failed';
              return { error: message };
            }
          },
        }),
        {
          name: 'edulite-user-storage',
          storage: createJSONStorage(() => secureStorage),
          partialize: (state) => ({
            user: state.user,
            isAuthenticated: state.isAuthenticated,
            isLoading: state.isLoading,
          }),
        },
      ),
    ),
  );

  const { data, isLoading, isSuccess } = useSessionQuery();

  useEffect(() => {
    if (isSuccess) {
      store.getState().setUser(data?.user ?? null);
    } else if (!isLoading && !data) {
      store.getState().setUser(null);
    }
  }, [data, isLoading, isSuccess, store]);

  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const store = useContext(AuthContext);
  if (!store) throw new Error('useAuth must be used within an AuthProvider');
  return useStore(store);
}
