import { NextRequest, NextResponse } from 'next/server';

type Tutorial = {
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

const mockTutorials: Tutorial[] = [
  {
    id: '1',
    subject: 'Maths',
    difficulty: 'Beginner',
    title: 'Introduction to Algebra: Solving Linear Equations',
    instructor: 'Dr. Sarah Chen',
    duration: '25 min',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    objectives: [
      'Understand basic algebraic concepts',
      'Learn to solve linear equations',
      'Apply algebra in real-world problems',
    ],
    description: 'Learn how to solve linear equations step by step, with practical examples and exercises.',
    createdAt: '2025-10-20T08:30:00Z',
  },
  {
    id: '2',
    subject: 'Science',
    difficulty: 'Intermediate',
    title: 'Chemistry Fundamentals: Understanding Chemical Bonds',
    instructor: 'Prof. Mark Johnson',
    duration: '32 min',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    objectives: [
      'Explore different types of chemical bonds',
      'Understand how atoms combine to form molecules',
      'Analyze the properties of ionic, covalent, and metallic bonds',
    ],
    description: 'Explore ionic, covalent and metallic bonds, with interactive quizzes and visualizations.',
    createdAt: '2025-10-18T10:15:00Z',
  },
  {
    id: '3',
    subject: 'History',
    difficulty: 'Advanced',
    title: 'Ancient Civilizations: The Rise and Fall of Rome',
    instructor: 'Dr. Emily Rodriguez',
    duration: '28 min',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    objectives: [
      'Trace the history of Ancient Rome',
      'Understand key factors in Rome’s rise and fall',
      'Examine the cultural and political legacy of Rome',
    ],
    description: 'An in-depth look at Rome’s rise and fall, covering key emperors and major historical turning points.',
    createdAt: '2025-10-22T09:45:00Z',
  },
  {
    id: '4',
    subject: 'Maths',
    difficulty: 'Advanced',
    title: 'Calculus Made Easy: Derivatives and Applications',
    instructor: 'Dr. Michael Park',
    duration: '45 min',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    objectives: [
      'Understand the concept of derivatives',
      'Learn differentiation techniques',
      'Apply derivatives to solve real-world problems',
    ],
    description: 'Dive into derivatives and real-world applications of calculus for engineers and scientists.',
    createdAt: '2025-10-19T14:50:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    // Optionally allow query params, e.g., subject filter
    const url = new URL(request.url);
    const subject = url.searchParams.get('subject');
    const difficulty = url.searchParams.get('difficulty');
    let data = mockTutorials;

    if (subject && subject !== 'All') {
      data = mockTutorials.filter((t) => t.subject === subject);
    }
    if (difficulty) {
      data = data.filter((t) => t.difficulty === difficulty);
    }

    return NextResponse.json({ tutorials: data }, { status: 200 });
  } catch (error) {
    console.error('Tutorial error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
