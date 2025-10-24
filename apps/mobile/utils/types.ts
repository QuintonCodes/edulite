import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  language: z.string().nullable(),
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

export type LoginResponse = {
  message: string;
  accessToken: string;
  user: User;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  language: string;
  role: 'student' | 'teacher' | 'admin';
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: Date;
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
  description: string;
  createdAt: string;
};

export type Achievement = {
  id: string;
  icon: {
    name: string;
    library: string;
    color: string;
  };
  title: string;
  subtitle: string;
  earned: boolean;
};
