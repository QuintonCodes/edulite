import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { API_BASE } from '@/utils/constants';

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
};

type QuizData = {
  id: string;
  title: string;
  questions: QuizQuestion[];
  type: 'tutorial' | 'assessment';
};

export function useQuiz(quizId: string, type: string) {
  return useQuery({
    queryKey: ['quiz', quizId, type],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (quizId) params.id = quizId;
      if (type) params.type = type;

      const { data } = await axios.get<QuizData>(`${API_BASE}/quiz?id=${quizId}&type=${type}`, {
        params,
      });

      return data;
    },
    enabled: !!quizId && !!type, // Only run query if id and type are provided
  });
}
