import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { useSessionQuery } from '@/hooks/useSession';
import { getNewlyEarnedAchievements } from '@/utils/achievementSystem'; // Import achievement checker
import { authService } from '@/utils/apiService';
import { awardXP, XP_REWARDS } from '@/utils/levelSystem';
import type { RegisterInput, User } from '@/utils/types';
import Toast from 'react-native-toast-message';

const isYesterday = (date: Date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

// Helper to check if a date is today
const isToday = (date: Date) => {
  return date.toDateString() === new Date().toDateString();
};

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
  checkDailyLogin: () => void;
};

const secureStorage = {
  getItem: async (name: string) => await SecureStore.getItemAsync(name),
  setItem: async (name: string, value: string) => await SecureStore.setItemAsync(name, value),
  removeItem: async (name: string) => await SecureStore.deleteItemAsync(name),
};

const AuthContext = createContext<StoreApi<AuthStore> | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
              get().checkDailyLogin();
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
              get().checkDailyLogin();
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

          checkDailyLogin: () => {
            const user = get().user;
            if (!user) return;

            const today = new Date();
            const lastLoginDate = user.lastLogin ? new Date(user.lastLogin) : null;

            if (lastLoginDate && isToday(lastLoginDate)) {
              // Already logged in today
              return;
            }

            let xpGained = XP_REWARDS.DAILY_LOGIN;
            let newStreak = user.streak || 0;
            let newLoginStreak = user.loginStreak || 0;

            if (lastLoginDate && isYesterday(lastLoginDate)) {
              // Consecutive login
              newStreak += 1;
              newLoginStreak += 1;
            } else {
              // Not consecutive, reset
              newStreak = 1;
              newLoginStreak = 1;
            }

            // Check for streak bonuses
            if (newStreak === 7) xpGained += XP_REWARDS.WEEK_STREAK;
            if (newStreak === 30) xpGained += XP_REWARDS.MONTH_STREAK;

            // Get old stats
            const oldStats = {
              ...user,
              totalXP: user.xp || 0,
              level: user.level || 1,
              streak: user.streak || 0,
              loginStreak: user.loginStreak || 0,
            };

            // Calculate new XP
            const { newXP, leveledUp, newLevel } = awardXP(oldStats.totalXP, xpGained);

            // Get new stats
            const newStats = {
              ...oldStats,
              totalXP: newXP,
              level: newLevel || oldStats.level,
              streak: newStreak,
              loginStreak: newLoginStreak,
            };

            // Check for achievements
            const newAchievements = getNewlyEarnedAchievements(oldStats, newStats);
            const newAchievementIds = newAchievements.map((a) => a.id);
            const allAchievementIds = [...(user.earnedAchievements || []), ...newAchievementIds];

            // Update user in state
            get().updateUser({
              lastLogin: today.toISOString(),
              streak: newStreak,
              loginStreak: newLoginStreak,
              xp: newXP,
              level: newStats.level,
              earnedAchievements: allAchievementIds,
            });

            // Show Toasts
            Toast.show({
              type: 'success',
              text1: 'Daily Login!',
              text2: `You earned +${xpGained} XP!`,
            });

            if (leveledUp && newLevel) {
              setTimeout(
                () => Toast.show({ type: 'info', text1: 'Level Up!', text2: `You reached Level ${newLevel}!` }),
                500,
              );
            }
            if (newAchievements.length > 0) {
              setTimeout(
                () => Toast.show({ type: 'info', text1: 'Achievement Unlocked!', text2: newAchievements[0].title }),
                1000,
              );
            }
          },
        }),
        {
          name: 'edulite-user-storage',
          storage: createJSONStorage(() => secureStorage),
        },
      ),
    ),
  );

  const { data, isLoading, isSuccess, isError, error } = useSessionQuery();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (isSuccess && data.user) {
      store.getState().setUser(data.user);
      store.getState().checkDailyLogin();
    } else if (isError) {
      store.getState().setUser(null);
      const is401 = (error as any)?.response?.status === 401;
      if (!is401) {
        console.warn('Unexpected session error:', error);
      }
    } else if (!data) {
      store.getState().setUser(null);
    }
  }, [data, isLoading, isSuccess, isError, error, store]);

  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const store = useContext(AuthContext);
  if (!store) throw new Error('useAuth must be used within an AuthProvider');
  return useStore(store);
}
