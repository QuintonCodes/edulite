/**
 * Level System Configuration
 * Defines XP requirements and titles for each level
 */

export type LevelData = {
  level: number;
  title: string;
  xpRequired: number;
};

export type LevelProgress = {
  currentLevel: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  progressPercentage: number;
  totalXP: number;
};

// XP rewards for different actions
export const XP_REWARDS = {
  DAILY_LOGIN: 10,
  COMPLETE_LESSON: 50,
  COMPLETE_COURSE: 200,
  COMPLETE_QUIZ: 30,
  PERFECT_QUIZ: 50, // All questions correct
  COMPLETE_TUTORIAL: 40,
  FIRST_LESSON: 25, // Bonus for first lesson
  WEEK_STREAK: 100, // Bonus for 7-day streak
  MONTH_STREAK: 500, // Bonus for 30-day streak
  ACHIEVEMENT_UNLOCK: 75,
  HELP_PEER: 20, // For helping other students (future feature)
  CREATE_NOTE: 5,
  SHARE_RESOURCE: 15,
};

// Level titles based on achievement
const LEVEL_TITLES: { [key: number]: string } = {
  1: 'Novice Learner',
  5: 'Dedicated Student',
  10: 'Knowledge Seeker',
  15: 'Eager Scholar',
  20: 'Bright Mind',
  25: 'Rising Star',
  30: 'Brilliant Thinker',
  35: 'Academic Ace',
  40: 'Master Student',
  50: 'Elite Scholar',
  60: 'Wisdom Keeper',
  75: 'Legendary Sage',
  100: 'Grand Master',
};

/**
 * Calculate XP required for a specific level
 * Uses exponential growth formula: baseXP * (level ^ exponent)
 */
export function calculateXPForLevel(level: number): number {
  const baseXP = 100;
  const exponent = 1.5;
  return Math.floor(baseXP * Math.pow(level, exponent));
}

/**
 * Calculate cumulative XP required to reach a specific level
 */
export function calculateTotalXPForLevel(level: number): number {
  let totalXP = 0;
  for (let i = 1; i < level; i++) {
    totalXP += calculateXPForLevel(i);
  }
  return totalXP;
}

/**
 * Calculate current level based on total XP
 */
export function calculateLevel(totalXP: number): LevelData {
  let level = 1;
  let xpForCurrentLevel = 0;

  // Find the highest level the user has reached
  while (xpForCurrentLevel <= totalXP) {
    level++;
    xpForCurrentLevel = calculateTotalXPForLevel(level);
  }

  level--; // Step back to the actual current level

  // Get the appropriate title
  const title = getLevelTitle(level);
  const xpRequired = calculateTotalXPForLevel(level);

  return {
    level,
    title,
    xpRequired,
  };
}

/**
 * Get level title based on level number
 */
function getLevelTitle(level: number): string {
  // Find the closest level title
  const titleLevels = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a);

  for (const titleLevel of titleLevels) {
    if (level >= titleLevel) {
      return LEVEL_TITLES[titleLevel];
    }
  }

  return LEVEL_TITLES[1];
}

/**
 * Calculate progress towards next level
 */
export function getLevelProgress(totalXP: number): LevelProgress {
  const currentLevelData = calculateLevel(totalXP);
  const currentLevel = currentLevelData.level;

  const xpForCurrentLevel = calculateTotalXPForLevel(currentLevel);
  const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
  const currentLevelXP = totalXP - xpForCurrentLevel;

  const progressPercentage = Math.min(100, Math.floor((currentLevelXP / xpForNextLevel) * 100));

  return {
    currentLevel,
    currentLevelXP,
    xpForNextLevel,
    progressPercentage,
    totalXP,
  };
}

/**
 * Award XP to user and return new total
 */
export function awardXP(
  currentXP: number,
  xpToAdd: number,
): {
  newXP: number;
  leveledUp: boolean;
  newLevel?: number;
  oldLevel?: number;
} {
  const oldLevel = calculateLevel(currentXP).level;
  const newXP = currentXP + xpToAdd;
  const newLevel = calculateLevel(newXP).level;

  return {
    newXP,
    leveledUp: newLevel > oldLevel,
    newLevel: newLevel > oldLevel ? newLevel : undefined,
    oldLevel: newLevel > oldLevel ? oldLevel : undefined,
  };
}
