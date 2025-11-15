import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { apiFetch, getAccessToken } from '@/utils/apiClient';
import { User } from '@/utils/types';

type SessionResponse = {
  user: User | null;
  isAuthenticated: boolean;
};

export function useSessionQuery() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const storedToken = await getAccessToken();
      setToken(storedToken);
    })();
  }, []);

  return useQuery<SessionResponse>({
    queryKey: ['session'],
    queryFn: async () => {
      if (!token) {
        return { user: null, isAuthenticated: false };
      }

      try {
        const { data } = await apiFetch('/auth/session', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      } catch (error: any) {
        // If refresh also failed, user is logged out
        if (error.response?.status === 401) {
          return { user: null, isAuthenticated: false };
        }

        throw error;
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: false,
  });
}
