import { API_BASE } from '@/utils/constants'; // Assuming you have this
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type InProgressCourse = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
};

const fetchMyCourses = async (userId: string): Promise<InProgressCourse[]> => {
  const { data } = await axios.get<InProgressCourse[]>(`${API_BASE}/courses/my-courses`, {
    params: { userId },
  });
  return data;
};

export function useMyCourses(userId?: string) {
  return useQuery<InProgressCourse[], Error>({
    queryKey: ['my-courses', userId],
    queryFn: () => fetchMyCourses(userId!),
    enabled: !!userId,
  });
}
