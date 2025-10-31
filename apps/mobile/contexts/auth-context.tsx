import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { useSessionQuery } from '@/hooks/useSession';
import { authService } from '@/utils/authService';
import type { RegisterInput, User } from '@/utils/types';

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user?: User | null) => void;
  updateUser: (user?: Partial<User> | ((prev: User) => Partial<User>)) => void;
  register: (data: RegisterInput) => Promise<{ user?: User; error?: string }>;
  login: (email: string, password: string) => Promise<{ user?: User; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  verify: (email: string, code: string) => Promise<{ user?: User; error?: string }>;
  resendCode: (email: string) => Promise<{ success?: boolean; error?: string }>;
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

          updateUser: (user) => {
            const currentUser = get().user;
            if (!currentUser) return;

            const updatedUser = typeof user === 'function' ? user(currentUser) : user;
            set({ user: { ...currentUser, ...updatedUser } });
          },

          register: async (data) => {
            set({ isLoading: true });
            const result = await authService.register(data);

            if (result.user) {
              set({ user: result.user, isAuthenticated: true, isLoading: false });
            } else {
              set({ isLoading: false });
            }

            return result;
          },

          login: async (email, password) => {
            set({ isLoading: true });
            const result = await authService.login(email, password);

            if (result.user) {
              set({ user: result.user, isAuthenticated: true, isLoading: false });
            } else {
              set({ isLoading: false });
            }

            return result;
          },

          logout: async () => {
            await authService.logout();
            set({ user: null, isAuthenticated: false, isLoading: false });
            get().refreshSession();
          },

          refreshSession: async () => {
            await queryClient.invalidateQueries({ queryKey: ['session'] });
          },

          verify: async (email: string, code: string) => {
            set({ isLoading: true });
            const result = await authService.verify(email, code);

            if (result.user) {
              set({ user: result.user, isAuthenticated: true, isLoading: false });
            } else {
              set({ isLoading: false });
            }

            return result;
          },

          resendCode: authService.resend,
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
