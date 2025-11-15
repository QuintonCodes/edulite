import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { API_BASE } from '@/utils/constants'; // Assuming you have this
import { QuizData } from '@/utils/types';

const fetchAssessmentQuizzes = async (subject: string): Promise<QuizData[]> => {
  const { data } = await axios.get<{ quizzes: QuizData[] }>(`${API_BASE}/quiz`, {
    params: {
      type: 'assessment',
      subject: subject,
    },
  });
  return data.quizzes;
};

export function useAssessmentQuizzes(subject: string) {
  return useQuery({
    queryKey: ['quizzes', 'assessment', subject],
    queryFn: () => fetchAssessmentQuizzes(subject),
  });
}
