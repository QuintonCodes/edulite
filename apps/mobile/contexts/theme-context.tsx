import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';

// Define the shape of the context data
type Theme = 'light' | 'dark';
type ThemeContextData = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

// Create the context with a default value
const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

// Define the props for the provider
type ThemeProviderProps = {
  children: ReactNode;
};

// Storage key
const THEME_STORAGE_KEY = 'app_theme';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>(systemScheme || 'light');
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  // Effect to load saved theme from AsyncStorage on mount
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = (await SecureStore.getItemAsync(THEME_STORAGE_KEY)) as Theme | null;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setThemeState(savedTheme);
        } else {
          // If no saved theme, use the system preference
          setThemeState(systemScheme || 'light');
        }
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
        setThemeState(systemScheme || 'light'); // Fallback
      } finally {
        setIsThemeLoading(false);
      }
    }

    loadTheme();
  }, [systemScheme]);

  // Effect to listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      (async () => {
        try {
          const savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
          if (!savedTheme && colorScheme) {
            setThemeState(colorScheme);
          }
        } catch (error) {
          console.error('Failed to check saved theme:', error);
        }
      })();
    });

    return () => subscription.remove();
  }, []);

  async function saveTheme(newTheme: Theme) {
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme to storage:', error);
    }
  }

  function setTheme(newTheme: Theme) {
    setThemeState(newTheme);
    saveTheme(newTheme);
  }

  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }

  // Don't render children until the theme is loaded to avoid flicker
  if (isThemeLoading) {
    return null; // Or a loading spinner
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>;
};

// Custom hook to easily consume the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
