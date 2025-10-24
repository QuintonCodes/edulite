import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { getAccessToken } from '@/utils/api';
import { API_BASE } from '@/utils/constants';
import type { Tutorial } from '@/utils/types';

export function useTutorials(subject?: string, difficulty?: string) {
  return useQuery({
    queryKey: ['tutorials', subject || 'All', difficulty || ''],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error('No access token');

      const params: Record<string, string> = {};
      if (subject && subject !== 'All') params.subject = subject;
      if (difficulty) params.difficulty = difficulty;

      const { data } = await axios.get<{ tutorials: Tutorial[] }>(
        `${API_BASE}/tutorials${subject && subject !== 'All' ? `?subject=${subject}` : ''}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params,
        },
      );

      return data.tutorials;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
