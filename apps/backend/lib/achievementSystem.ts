type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedAt?: Date;
  category: 'learning' | 'progress' | 'social' | 'milestone' | 'special';
  requirement: {
    type: string;
    value: number;
  };
};

type UserStats = {
  lessonsCompleted?: number;
  coursesCompleted?: number;
  streak?: number;
  loginStreak?: number;
  quizzesCompleted?: number;
  perfectQuizzes?: number;
  totalXP?: number;
  level?: number;
  nightLessons?: number;
  maxLessonsInDay?: number;
  earnedAchievements?: string[];
};

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'earned' | 'earnedAt'>[] = [
  // Learning Achievements
  {
    id: 'first_lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: 'book-outline',
    color: '#3b82f6',
    category: 'learning',
    requirement: { type: 'lessons_completed', value: 1 },
  },
  {
    id: 'lesson_master',
    title: 'Lesson Master',
    description: 'Complete 50 lessons',
    icon: 'school-outline',
    color: '#8b5cf6',
    category: 'learning',
    requirement: { type: 'lessons_completed', value: 50 },
  },
  {
    id: 'course_complete',
    title: 'Course Conqueror',
    description: 'Complete your first course',
    icon: 'trophy-outline',
    color: '#f59e0b',
    category: 'learning',
    requirement: { type: 'courses_completed', value: 1 },
  },
  {
    id: 'multi_course',
    title: 'Multi-Talented',
    description: 'Complete 5 different courses',
    icon: 'ribbon-outline',
    color: '#ec4899',
    category: 'learning',
    requirement: { type: 'courses_completed', value: 5 },
  },

  // Progress Achievements
  {
    id: 'week_streak',
    title: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: 'flame-outline',
    color: '#ef4444',
    category: 'progress',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'month_streak',
    title: 'Unstoppable',
    description: 'Maintain a 30-day learning streak',
    icon: 'flash-outline',
    color: '#f97316',
    category: 'progress',
    requirement: { type: 'streak', value: 30 },
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Log in for 10 consecutive days',
    icon: 'sunny-outline',
    color: '#fbbf24',
    category: 'progress',
    requirement: { type: 'login_streak', value: 10 },
  },

  // Quiz Achievements
  {
    id: 'quiz_starter',
    title: 'Quiz Starter',
    description: 'Complete your first quiz',
    icon: 'clipboard-outline',
    color: '#06b6d4',
    category: 'learning',
    requirement: { type: 'quizzes_completed', value: 1 },
  },
  {
    id: 'perfect_score',
    title: 'Perfectionist',
    description: 'Get a perfect score on 5 quizzes',
    icon: 'star-outline',
    color: '#fbbf24',
    category: 'learning',
    requirement: { type: 'perfect_quizzes', value: 5 },
  },

  // XP Milestones
  {
    id: 'xp_1000',
    title: 'Rising Star',
    description: 'Earn 1,000 XP',
    icon: 'sparkles-outline',
    color: '#a855f7',
    category: 'milestone',
    requirement: { type: 'total_xp', value: 1000 },
  },
  {
    id: 'xp_5000',
    title: 'XP Champion',
    description: 'Earn 5,000 XP',
    icon: 'medal-outline',
    color: '#d946ef',
    category: 'milestone',
    requirement: { type: 'total_xp', value: 5000 },
  },
  {
    id: 'xp_10000',
    title: 'XP Legend',
    description: 'Earn 10,000 XP',
    icon: 'diamond-outline',
    color: '#ec4899',
    category: 'milestone',
    requirement: { type: 'total_xp', value: 10000 },
  },

  // Level Achievements
  {
    id: 'level_10',
    title: 'Decade Achiever',
    description: 'Reach level 10',
    icon: 'trending-up-outline',
    color: '#10b981',
    category: 'milestone',
    requirement: { type: 'level', value: 10 },
  },
  {
    id: 'level_25',
    title: 'Quarter Century',
    description: 'Reach level 25',
    icon: 'rocket-outline',
    color: '#3b82f6',
    category: 'milestone',
    requirement: { type: 'level', value: 25 },
  },
  {
    id: 'level_50',
    title: 'Elite Scholar',
    description: 'Reach level 50',
    icon: 'shield-outline',
    color: '#8b5cf6',
    category: 'milestone',
    requirement: { type: 'level', value: 50 },
  },

  // Special Achievements
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete lessons late at night (10 times)',
    icon: 'moon-outline',
    color: '#6366f1',
    category: 'special',
    requirement: { type: 'night_lessons', value: 10 },
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete 10 lessons in one day',
    icon: 'speedometer-outline',
    color: '#ef4444',
    category: 'special',
    requirement: { type: 'lessons_in_day', value: 10 },
  },
];

/**
 * Check if user has earned a specific achievement
 */
export function checkAchievement(
  achievementId: string,
  userStats: {
    lessonsCompleted?: number;
    coursesCompleted?: number;
    streak?: number;
    loginStreak?: number;
    quizzesCompleted?: number;
    perfectQuizzes?: number;
    totalXP?: number;
    level?: number;
    nightLessons?: number;
    maxLessonsInDay?: number;
  },
): boolean {
  const achievement = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === achievementId);
  if (!achievement) return false;

  const { type, value } = achievement.requirement;
  const statValue = userStats[type as keyof typeof userStats] || 0;

  return statValue >= value;
}

/**
 * Get all earned achievements for a user
 */
export function getUserAchievements(userStats: UserStats): Achievement[] {
  const earnedIds = new Set(userStats.earnedAchievements || []);

  return ACHIEVEMENT_DEFINITIONS.map((achievement) => {
    const isEarned = earnedIds.has(achievement.id);

    return {
      ...achievement,
      earned: isEarned,
      earnedAt: isEarned ? new Date() : undefined,
    };
  });
}

/**
 * Get newly earned achievements
 */
export function getNewlyEarnedAchievements(oldStats: UserStats, newStats: UserStats): Achievement[] {
  const newAchievements: Achievement[] = [];

  for (const achievement of ACHIEVEMENT_DEFINITIONS) {
    const wasEarned = checkAchievement(achievement.id, oldStats);
    const isEarned = checkAchievement(achievement.id, newStats);

    if (!wasEarned && isEarned) {
      newAchievements.push({
        ...achievement,
        earned: true,
        earnedAt: new Date(),
      });
    }
  }

  return newAchievements;
}
