import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';

// Define the shape of the context data
type Theme = 'light' | 'dark';
type ThemeContextData = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  initializeUserTheme: (userId: string | null) => Promise<void>;
};

// Create the context with a default value
const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

// Define the props for the provider
type ThemeProviderProps = {
  children: ReactNode;
};

// Storage key
const getUserThemeKey = (userId: string) => `user_theme_${userId}`;
const GUEST_THEME_KEY = 'guest_theme';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('light');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Initialize theme based on user status
  async function initializeUserTheme(userId: string | null) {
    setCurrentUserId(userId);

    try {
      if (userId) {
        // Logged in user - load their saved theme
        const userThemeKey = getUserThemeKey(userId);
        const savedTheme = (await SecureStore.getItemAsync(userThemeKey)) as Theme | null;

        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setThemeState(savedTheme);
        } else {
          // No saved preference - use system preference
          setThemeState(systemScheme || 'light');
          await SecureStore.setItemAsync(userThemeKey, systemScheme || 'light');
        }
      } else {
        // Guest user - always use light mode
        setThemeState('light');
        // Clear any guest theme preferences
        await SecureStore.deleteItemAsync(GUEST_THEME_KEY).catch(() => {});
      }
    } catch (error) {
      console.error('Failed to initialize theme:', error);
      setThemeState('light');
    }
  }

  async function saveTheme(newTheme: Theme) {
    try {
      if (currentUserId) {
        const userThemeKey = getUserThemeKey(currentUserId);
        await SecureStore.setItemAsync(userThemeKey, newTheme);
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  function setTheme(newTheme: Theme) {
    // Only allow theme changes for logged-in users
    if (!currentUserId) {
      console.warn('Theme changes are only available for logged-in users');
      return;
    }

    setThemeState(newTheme);
    saveTheme(newTheme);
  }

  function toggleTheme() {
    // Only allow theme toggle for logged-in users
    if (!currentUserId) {
      console.warn('Theme changes are only available for logged-in users');
      return;
    }

    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }

  // Effect to listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (!currentUserId) return;

      (async () => {
        try {
          const userThemeKey = getUserThemeKey(currentUserId);
          const savedTheme = await SecureStore.getItemAsync(userThemeKey);

          // Only apply system theme if user hasn't set a preference
          if (!savedTheme && colorScheme) {
            setThemeState(colorScheme);
          }
        } catch (error) {
          console.error('Failed to check saved theme:', error);
        }
      })();
    });

    return () => subscription.remove();
  }, [currentUserId]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, initializeUserTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to easily consume the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
