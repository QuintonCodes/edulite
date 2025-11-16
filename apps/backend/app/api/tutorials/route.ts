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
    id: '1',
    subject: 'Mathematics',
    difficulty: 'Grade 12',
    title: 'Calculus Grade 12 Tangent',
    instructor: 'Kevinmathscience',
    duration: '10 min',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
    videoUrl: 'http://www.youtube.com/watch?v=GLn81ACy_a4',
    objectives: [
      'Understand the concept of a derivative as a gradient',
      'Find the equation of a tangent line',
      'Understand perpendicular lines and their gradients',
    ],
    description:
      'An engaging tutorial on calculus concepts, focusing on finding the equation of a tangent line to a curve.',
    createdAt: '2025-10-20T08:30:00Z',
  },
  {
    id: '2',
    subject: 'Physical Sciences',
    difficulty: 'Grade 11',
    title: 'Grade 11 Newton Laws: Newtons 2nd law',
    instructor: 'Kevinmathscience',
    duration: '8 min',
    image: 'https://images.unsplash.com/photo-1633515403006-06f02888c3a9?w=400', // Doesn't show
    videoUrl: 'https://youtu.be/zxB1wmwEIr0?si=gpoEjxI-uWnPAiLw',
    objectives: [
      "Define Newton's Second Law of Motion",
      'Understand the relationship between net force, mass, and acceleration',
      'Apply F_net = ma to simple problems',
    ],
    description:
      "A clear, example-filled tutorial on Newton's Second Law, perfect for Grade 11 South African learners.",
    createdAt: '2025-10-18T10:15:00Z',
  },
  {
    id: '3',
    subject: 'Life Sciences',
    difficulty: 'Grade 12',
    title: 'Human Evolution - Grade 12 Life Sciences (Part 1)',
    instructor: 'Tourmaline Tutoring',
    duration: '25 min',
    image: 'https://images.unsplash.com/photo-1605792651479-d52c1f10da48?w=400', // Doesn't show
    videoUrl: 'http://www.youtube.com/watch?v=McYAit5ilcs',
    objectives: [
      'Interpret phylogenetic trees',
      'Identify key anatomical differences between humans and apes',
      'Understand the "Out of Africa" hypothesis and evidence for it',
    ],
    description:
      'A focused lesson on the human evolution section of the Grade 12 Life Sciences curriculum, using diagrams and examples.',
    createdAt: '2025-10-22T09:45:00Z',
  },
  {
    id: '4',
    subject: 'Geography',
    difficulty: 'Grade 10',
    title: 'Grade 10 Geography | Composition & Structure of the Atmosphere',
    instructor: 'Andrew Nkumanda',
    duration: '17 min',
    image: 'https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=400',
    videoUrl: 'http://www.youtube.com/watch?v=f6xMvZrUpLo',
    objectives: [
      'List the layers of the atmosphere',
      'Describe the characteristics of the Troposphere and Stratosphere',
      'Understand the importance of the Ozone layer',
    ],
    description:
      'Learn about the different layers and composition of the atmosphere in this video, designed for Grade 10 CAPS Geography.',
    createdAt: '2025-10-19T14:50:00Z',
  },
  {
    id: '5',
    subject: 'Accounting',
    difficulty: 'Grade 10',
    title: 'Grade 10 Accounting | Accounting equation',
    instructor: 'Accounting Solution SA',
    duration: '17 min',
    image: 'https://images.unsplash.com/photo-1554224155-16a57c2180f2?w=400', // Doesn't show
    videoUrl: 'http://www.youtube.com/watch?v=kpL2u4vFdMQ',
    objectives: [
      'Understand the basic accounting equation: A = OE + L',
      'Identify accounts as Assets, Owners Equity, or Liabilities',
      'Analyze transactions and their effect on the accounting equation',
    ],
    description:
      'A detailed walkthrough of the accounting equation, analyzing several transactions for Grade 10 learners.',
    createdAt: '2025-11-15T11:00:00Z',
  },
  {
    id: '6',
    subject: 'English',
    difficulty: 'Grade 12',
    title: 'Macbeth: Summary (Memorise & Recall)',
    instructor: 'Dr Aidan',
    duration: '12 min',
    image: 'https://images.unsplash.com/photo-1544502577-3e5c533e44c8?w=400', // Doesn't show
    videoUrl: 'http://www.youtube.com/watch?v=qxtmb0m38lI',
    objectives: [
      'Recall the main plot points of Macbeth, act by act',
      'Identify key themes like "Appearance vs. Reality"',
      'Understand the motivations of key characters like Macbeth and Lady Macbeth',
    ],
    description:
      "A fast-paced visual summary of Shakespeare's Macbeth, designed to help Grade 12 students memorize and recall the play's key events.",
    createdAt: '2025-11-14T15:30:00Z',
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
