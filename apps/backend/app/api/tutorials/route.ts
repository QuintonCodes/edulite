import { NextRequest, NextResponse } from 'next/server';

type Tutorial = {
  id: string;
  subject: string;
  difficulty: 'Grade 10' | 'Grade 11' | 'Grade 12';
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
    id: '1', // This ID matches the quiz ID in the new API route
    subject: 'Mathematics',
    difficulty: 'Grade 12',
    title: 'Calculus: Derivatives and Curve Sketching',
    instructor: 'Mindset Learn', //
    duration: '48 min',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
    videoUrl: 'https://www.youtube.com/watch?v=N-B_2yP1YfA',
    objectives: [
      'Understand the concept of a derivative',
      'Apply differentiation rules',
      'Analyze and sketch cubic functions',
    ],
    description:
      'A full lesson on Grade 12 Calculus, focusing on differentiation and the sketching of graphs. Aligned with the CAPS curriculum.',
    createdAt: '2025-10-20T08:30:00Z',
  },
  {
    id: '2', // This ID also matches a quiz
    subject: 'Physical Sciences',
    difficulty: 'Grade 11',
    title: "Newton's Laws of Motion",
    instructor: 'Kevinmathscience', //
    duration: '22 min',
    image: 'https://images.unsplash.com/photo-1633515403006-06f02888c3a9?w=400',
    videoUrl: 'https://www.youtube.com/watch?v=JcIMv2iXb00',
    objectives: [
      "Define Newton's First, Second, and Third Laws",
      'Solve problems involving F=ma',
      'Understand friction and normal forces',
    ],
    description: 'A clear, example-filled tutorial on Newtons Laws, perfect for Grade 11 South African learners.',
    createdAt: '2025-10-18T10:15:00Z',
  },
  {
    id: '3',
    subject: 'Life Sciences',
    difficulty: 'Grade 12',
    title: 'Human Evolution: Hominid Skulls',
    instructor: 'Miss Van Deventer', //
    duration: '14 min',
    image: 'https://images.unsplash.com/photo-1605792651479-d52c1f10da48?w=400',
    videoUrl: 'https://www.youtube.com/watch?v=JqXGg2kYyJc',
    objectives: [
      'Identify key features of hominid skulls',
      'Compare skulls of different hominid species',
      'Understand the "Out of Africa" hypothesis',
    ],
    description:
      'A focused lesson on the human evolution section of the Grade 12 Life Sciences curriculum, using skull diagrams.',
    createdAt: '2025-10-22T09:45:00Z',
  },
  {
    id: '4',
    subject: 'Geography',
    difficulty: 'Grade 10',
    title: 'The Structure of the Atmosphere',
    instructor: "Buddy's Academy", //
    duration: '12 min',
    image: 'https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=400',
    videoUrl: 'https://www.youtube.com/watch?v=0Lz8P1S1nUA',
    objectives: [
      'List the layers of the atmosphere',
      'Describe the characteristics of the Troposphere and Stratosphere',
      'Understand the importance of the Ozone layer',
    ],
    description:
      'Learn about the different layers of the atmosphere in this video, designed for Grade 10 CAPS Geography.',
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
