import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'english' | 'afrikaans' | null;

type LanguageState = {
  selectedLanguage: Language;
  setLanguage: (language: Language) => void;
  clearLanguage: () => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      selectedLanguage: null,
      setLanguage: (language) => set({ selectedLanguage: language }),
      clearLanguage: () => set({ selectedLanguage: null }),
    }),
    {
      name: 'language-storage', // key in AsyncStorage
    },
  ),
);
