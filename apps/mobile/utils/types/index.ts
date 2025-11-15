import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  language: z.string().min(1, 'Language is required'),
  role: z.enum(['student', 'teacher'], {
    required_error: 'Please select a role',
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export type RegisterResponse = {
  message: string;
  user: User;
};

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const editProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export type EditProfileInput = z.infer<typeof editProfileSchema>;

export const verifySchema = z.object({
  otp: z.string().length(4, 'Please enter a valid 4-digit code').regex(/^\d+$/, 'Only digits are allowed'),
});

export type VerifyFormInput = z.infer<typeof verifySchema>;

export type LoginResponse = {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type VerifyResponse = LoginResponse;

export type Media = {
  id: string;
  userId: string | null;
  publicId: string;
  type: string;
  url: string;
  format: string | null;
  size: number | null;
  createdAt: Date;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  language: string;
  role: 'student' | 'teacher' | 'admin';
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: string;
  lastLogin?: string;

  // XP and Level fields
  xp?: number;
  level?: number;

  // Stats fields
  coursesCompleted?: number;
  lessonsCompleted?: number;
  quizzesCompleted?: number;
  perfectQuizzes?: number;
  streak?: number;
  loginStreak?: number;
  maxLessonsInDay?: number;
  nightLessons?: number;

  // Achievement tracking
  earnedAchievements?: string[];
};

export type Tutorial = {
  id: string;
  subject: 'Maths' | 'Science' | 'History';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  instructor: string;
  duration: string;
  image: string;
  videoUrl: string;
  objectives: string[];
  description: string;
  createdAt: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  earned: boolean;
  earnedAt?: Date;
  category: 'learning' | 'progress' | 'social' | 'milestone' | 'special';
  requirement: {
    type: string;
    value: number;
  };
};

export type Quiz = {
  id: number;
  subject: string;
  title: string;
  description: string;
  duration: string;
  questions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
};

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
};

export type QuizData = {
  id: string;
  title: string;
  questions: QuizQuestion[];
  type: 'tutorial' | 'assessment';
  subject: string;
  difficulty: string;
  description: string;
  duration: string;
};

export type PastPaper = {
  id: string;
  fileName: string;
  url: string;
  subject: string;
  uploader: string;
  uploadDate: string;
  fileSize: string;
  fileType: string;
};
