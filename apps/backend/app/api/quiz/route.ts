import { NextRequest, NextResponse } from 'next/server';

// Define the types (can be shared from your app types)
type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
};

type QuizData = {
  id: string;
  title: string;
  questions: QuizQuestion[];
  type: 'tutorial' | 'assessment';
  subject: string;
  difficulty: string;
  description: string;
  duration: string;
};

// --- THE UNIVERSAL QUIZ BANK ---
// All quizzes live here. The key (e.g., '1', 'math-g12-calc') is the ID.
const quizBank: Record<string, QuizData> = {
  // --- Quizzes matching assessments.tsx (IDs 1-6) ---
  '1': {
    id: '1',
    title: 'Introduction to Algebra',
    subject: 'Mathematics',
    difficulty: 'Easy',
    type: 'assessment',
    description: 'Basic algebraic expressions and equations.',
    duration: '15 min',
    questions: [
      { id: 1, question: 'Solve for x: 2x + 3 = 7', options: ['1', '2', '3', '4'], correctAnswer: 1 },
      {
        id: 2,
        question: 'Simplify: 3(a + 2b)',
        options: ['3a + 6b', '3a + 2b', 'a + 6b', '3a - 6b'],
        correctAnswer: 0,
      },
    ],
  },
  '2': {
    id: '2',
    title: 'Cell Biology Fundamentals',
    subject: 'Life Sciences',
    difficulty: 'Medium',
    type: 'assessment',
    description: 'Understanding cells, organelles, and cellular processes.',
    duration: '20 min',
    questions: [
      {
        id: 1,
        question: 'What is the powerhouse of the cell?',
        options: ['Nucleus', 'Ribosome', 'Mitochondrion', 'Chloroplast'],
        correctAnswer: 2,
      },
      {
        id: 2,
        question: 'Which organelle is responsible for protein synthesis?',
        options: ['Ribosome', 'Golgi Apparatus', 'Lysosome', 'Vacuole'],
        correctAnswer: 0,
      },
    ],
  },
  '3': {
    id: '3',
    title: "Newton's Laws of Motion",
    subject: 'Physical Sciences',
    difficulty: 'Hard',
    type: 'assessment',
    description: 'Advanced problems on mechanics and motion.',
    duration: '30 min',
    questions: [
      {
        id: 1,
        question: 'Which law is also known as the law of inertia?',
        options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravitation'],
        correctAnswer: 0,
      },
      {
        id: 2,
        question: 'A force of 10N acts on a 2kg object. What is the acceleration?',
        options: ['20 m/s²', '12 m/s²', '8 m/s²', '5 m/s²'],
        correctAnswer: 3,
      },
    ],
  },
  '4': {
    id: '4',
    title: 'Chemical Bonding',
    subject: 'Physical Sciences',
    difficulty: 'Medium',
    type: 'assessment',
    description: 'Ionic, covalent, and metallic bonds explained',
    duration: '25 min',
    questions: [
      {
        id: 1,
        question: 'What type of bond forms between a metal and a non-metal?',
        options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'],
        correctAnswer: 0,
      },
      {
        id: 2,
        question: 'Which of these is a nonpolar covalent bond?',
        options: ['H₂O', 'CO₂', 'O₂', 'NH₃'],
        correctAnswer: 2,
      },
    ],
  },
  '5': {
    id: '5',
    title: 'Grammar and Punctuation',
    subject: 'English',
    difficulty: 'Easy',
    type: 'assessment',
    description: 'Essential English grammar rules and punctuation usage.',
    duration: '12 min',
    questions: [
      {
        id: 1,
        question: 'Choose the correct form: "They ___ going to the park."',
        options: ['is', 'are', 'am', 'be'],
        correctAnswer: 1,
      },
    ],
  },
  '6': {
    id: '6',
    title: 'Trigonometry Advanced',
    subject: 'Mathematics',
    difficulty: 'Hard',
    type: 'assessment',
    description: 'In-depth trigonometric functions and identities.',
    duration: '35 min',
    questions: [
      { id: 1, question: 'What is the value of sin(90°)?', options: ['0', '0.5', '1', '-1'], correctAnswer: 2 },
      { id: 2, question: 'Simplify: sin²(θ) + cos²(θ)', options: ['0', '1', '2', 'tan²(θ)'], correctAnswer: 1 },
    ],
  },
  // --- NEW Grade 10-12 Quizzes ---
  'math-g12-calc': {
    id: 'math-g12-calc',
    title: 'Grade 12 Calculus',
    subject: 'Mathematics',
    difficulty: 'Hard',
    type: 'assessment',
    description: 'Derivatives and curve sketching for Grade 12.',
    duration: '20 min',
    questions: [
      {
        id: 1,
        question: 'Find the derivative of f(x) = 3x² + 2x - 1',
        options: ['6x + 2', '3x + 2', '6x - 1', 'x² + x'],
        correctAnswer: 0,
      },
      {
        id: 2,
        question: 'What is the gradient of the tangent to the curve y = x³ at x = 2?',
        options: ['6', '8', '10', '12'],
        correctAnswer: 3,
      },
    ],
  },
  'lifesci-g12-dna': {
    id: 'lifesci-g12-dna',
    title: 'Grade 12 DNA & RNA',
    subject: 'Life Sciences',
    difficulty: 'Hard',
    type: 'assessment',
    description: 'Test your knowledge of DNA replication and transcription.',
    duration: '20 min',
    questions: [
      {
        id: 1,
        question: 'Which base is found in RNA but not DNA?',
        options: ['Adenine', 'Guanine', 'Cytosine', 'Uracil'],
        correctAnswer: 3,
      },
      {
        id: 2,
        question: 'The process of making mRNA from a DNA template is called:',
        options: ['Translation', 'Transcription', 'Replication', 'Mutation'],
        correctAnswer: 1,
      },
    ],
  },
  'geo-g10-atmos': {
    id: 'geo-g10-atmos',
    title: 'Grade 10 Atmosphere',
    subject: 'Geography',
    difficulty: 'Easy',
    type: 'assessment',
    description: 'Basics of the Earth’s atmosphere and weather patterns.',
    duration: '15 min',
    questions: [
      {
        id: 1,
        question: 'In which layer of the atmosphere does most weather occur?',
        options: ['Troposphere', 'Stratosphere', 'Mesosphere', 'Thermosphere'],
        correctAnswer: 0,
      },
    ],
  },
  'acc-g10-ledger': {
    id: 'acc-g10-ledger',
    title: 'Grade 10 General Ledger',
    subject: 'Accounting',
    difficulty: 'Medium',
    type: 'assessment',
    description: 'Understanding T-accounts and ledger entries.',
    duration: '18 min',
    questions: [
      {
        id: 1,
        question: 'The left side of a T-account is the:',
        options: ['Debit side', 'Credit side', 'Balance side', 'Income side'],
        correctAnswer: 0,
      },
      {
        id: 2,
        question: 'Which of the following is an Asset account?',
        options: ['Capital', 'Creditors Control', 'Bank', 'Sales'],
        correctAnswer: 2,
      },
    ],
  },
  // --- Tutorial Quizzes (matching previous tutorial IDs) ---
  'tutorial-1': {
    id: 'tutorial-1',
    title: 'Grade 12 Maths Check',
    subject: 'Mathematics',
    difficulty: 'Medium',
    type: 'tutorial',
    description: 'A quick check on Grade 12 Calculus.',
    duration: '5 min',
    questions: [
      { id: 1, question: 'What is the derivative of x^2?', options: ['2x', 'x', 'x^3', '2'], correctAnswer: 0 },
    ],
  },
  'tutorial-2': {
    id: 'tutorial-2',
    title: 'Grade 11 Physics Check',
    subject: 'Physical Sciences',
    difficulty: 'Medium',
    type: 'tutorial',
    description: 'A quick check on Newtons Laws.',
    duration: '5 min',
    questions: [
      {
        id: 1,
        question: "What is Newton's Second Law?",
        options: ['F=ma', 'E=mc^2', 'v=d/t', 'P=IV'],
        correctAnswer: 0,
      },
    ],
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('id');
    const type = searchParams.get('type');
    const subject = searchParams.get('subject');

    // --- Scenario 1: Get a single, specific quiz ---
    if (quizId && type) {
      const quizData = Object.values(quizBank).find((quiz) => quiz.id === quizId && quiz.type === type);

      if (!quizData) {
        return NextResponse.json({ error: `Quiz not found for id: ${quizId} and type: ${type}` }, { status: 404 });
      }
      return NextResponse.json(quizData, { status: 200 });
    }

    // --- Scenario 2: Get all quizzes (for assessment list) ---
    if (type === 'assessment') {
      let quizzes = Object.values(quizBank).filter((quiz) => quiz.type === 'assessment');

      // Optional filtering
      if (subject && subject !== 'All Subjects') {
        quizzes = quizzes.filter((quiz) => quiz.subject === subject);
      }

      // We don't return full questions list here, just the metadata
      const quizList = quizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        subject: quiz.subject,
        difficulty: quiz.difficulty,
        description: quiz.description,
        duration: quiz.duration,
        questions: quiz.questions.length, // Return question count
      }));

      return NextResponse.json({ quizzes: quizList }, { status: 200 });
    }

    // --- Scenario 3: Get all tutorial quizzes (if needed) ---
    if (type === 'tutorial') {
      // ... (add logic if you ever need to list all tutorial quizzes)
    }

    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
  } catch (error) {
    console.error('Quiz API error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
