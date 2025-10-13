// data/tutorialData.ts

export interface Tutorial {
  id: string;
  subject: 'Maths' | 'Science' | 'History';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  instructor: string;
  duration: string;
  image: string;
}

export const tutorialData: Tutorial[] = [
  {
    id: '1',
    subject: 'Maths',
    difficulty: 'Beginner',
    title: 'Introduction to Algebra: Solving Linear Equations',
    instructor: 'Dr. Sarah Chen',
    duration: '25 min',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    subject: 'Science',
    difficulty: 'Intermediate',
    title: 'Chemistry Fundamentals: Understanding Chemical Bonds',
    instructor: 'Prof. Mark Johnson',
    duration: '32 min',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    subject: 'History',
    difficulty: 'Advanced',
    title: 'Ancient Civilizations: The Rise and Fall of Rome',
    instructor: 'Dr. Emily Rodriguez',
    duration: '28 min',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=300&fit=crop',
  },
  {
    id: '4',
    subject: 'Maths',
    difficulty: 'Advanced',
    title: 'Calculus Made Easy: Derivatives and Applications',
    instructor: 'Dr. Michael Park',
    duration: '45 min',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
  },
  {
    id: '5',
    subject: 'Science',
    difficulty: 'Intermediate',
    title: "Physics: Newton's Laws of Motion Explained",
    instructor: 'Dr. Lisa Wang',
    duration: '35 min',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop',
  },
  {
    id: '6',
    subject: 'History',
    difficulty: 'Intermediate',
    title: 'World War II: Key Events and Turning Points',
    instructor: 'Prof. David Thompson',
    duration: '42 min',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=300&fit=crop',
  },
];