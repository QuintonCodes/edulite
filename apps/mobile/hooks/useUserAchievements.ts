import { useQuery } from '@tanstack/react-query';

import { getUserAchievements } from '@/utils/achievementSystem';
import { calculateLevel } from '@/utils/levelSystem';
import { Achievement, User } from '@/utils/types';

type UserStats = Pick<
  User,
  | 'lessonsCompleted'
  | 'coursesCompleted'
  | 'streak'
  | 'loginStreak'
  | 'quizzesCompleted'
  | 'perfectQuizzes'
  | 'xp'
  | 'nightLessons'
  | 'maxLessonsInDay'
  | 'earnedAchievements'
>;

export function useUserAchievements(userId?: string, userStats: Partial<UserStats> | null = null) {
  return useQuery({
    queryKey: ['achievements', userId],
    queryFn: async (): Promise<Achievement[]> => {
      const statsToProcess = {
        lessonsCompleted: userStats?.lessonsCompleted || 0,
        coursesCompleted: userStats?.coursesCompleted || 0,
        streak: userStats?.streak || 0,
        loginStreak: userStats?.loginStreak || 0,
        quizzesCompleted: userStats?.quizzesCompleted || 0,
        perfectQuizzes: userStats?.perfectQuizzes || 0,
        totalXP: userStats?.xp || 0,
        level: calculateLevel(userStats?.xp || 0).level,
        nightLessons: userStats?.nightLessons || 0,
        maxLessonsInDay: userStats?.maxLessonsInDay || 0,
        earnedAchievements: userStats?.earnedAchievements || [],
      };

      return getUserAchievements(statsToProcess);
    },
    enabled: !!userId && !!userStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
