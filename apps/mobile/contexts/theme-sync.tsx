import { useEffect } from 'react';

import { useAuth } from './auth-context';
import { useTheme } from './theme-context';

export function ThemeSync() {
  const { user, isAuthenticated } = useAuth();
  const { initializeUserTheme } = useTheme();

  useEffect(() => {
    // Initialize theme whenever auth state changes
    initializeUserTheme(isAuthenticated && user ? user.id : null);
  }, [isAuthenticated, initializeUserTheme, user]);

  return null;
}
