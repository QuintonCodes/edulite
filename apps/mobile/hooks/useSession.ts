import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { getAccessToken } from '@/utils/api';
import { API_BASE } from '@/utils/constants';
import { User } from '@/utils/types';

type SessionResponse = {
  user: User | null;
  isAuthenticated: boolean;
};

export function useSessionQuery() {
  return useQuery<SessionResponse>({
    queryKey: ['session'],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error('No access token');

      const { data } = await axios.get<SessionResponse>(`${API_BASE}/auth/session`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}
