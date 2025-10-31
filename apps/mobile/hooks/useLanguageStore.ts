import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type Language = 'english' | 'afrikaans' | null;

type LanguageState = {
  selectedLanguage: Language;
  setLanguage: (language: Language) => void;
  clearLanguage: () => void;
};

const secureStorage = {
  getItem: async (name: string) => await SecureStore.getItemAsync(name),
  setItem: async (name: string, value: string) => await SecureStore.setItemAsync(name, value),
  removeItem: async (name: string) => await SecureStore.deleteItemAsync(name),
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      selectedLanguage: null,
      setLanguage: (language) => set({ selectedLanguage: language }),
      clearLanguage: () => set({ selectedLanguage: null }),
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
