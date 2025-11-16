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

const quizBank: Record<string, QuizData> = {
  'assessment-1': {
    id: 'assessment-1',
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
  'assessment-2': {
    id: 'assessment-2',
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
  'assessment-3': {
    id: 'assessment-3',
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

  '1': {
    id: '1',
    title: 'Calculus: Tangents Check',
    subject: 'Mathematics',
    difficulty: 'Grade 12',
    type: 'tutorial',
    description: 'A quick check on the Calculus Tangents tutorial.',
    duration: '5 min',
    questions: [
      {
        id: 1,
        question: "The first derivative, f'(x), represents the...",
        options: ['...original function', '...gradient of the tangent', '...y-intercept', '...turning point'],
        correctAnswer: 1,
      },
      {
        id: 2,
        question: 'If two lines are perpendicular, their gradients (m1 and m2) have a product of:',
        options: ['1', '0', '-1', '2'],
        correctAnswer: 2,
      },
      {
        id: 3,
        question: 'What is the first step to find the equation of a tangent line to a curve y=f(x) at x=a?',
        options: [
          'Find the y-intercept',
          'Set the equation to zero',
          "Find the first derivative f'(x)",
          "Find the second derivative f''(x)",
        ],
        correctAnswer: 2,
      },
    ],
  },
  '2': {
    id: '2',
    title: "Newton's 2nd Law Check",
    subject: 'Physical Sciences',
    difficulty: 'Grade 11',
    type: 'tutorial',
    description: "A quick check on the Newton's 2nd Law tutorial.",
    duration: '5 min',
    questions: [
      {
        id: 1,
        question: "What is the formula for Newton's Second Law?",
        options: ['F_net = m/a', 'a = F_net / m', 'm = F_net * a', 'F_net = m + a'],
        correctAnswer: 1,
      },
      {
        id: 2,
        question: 'If the net force on an object is zero, the object will...',
        options: ['...speed up', '...slow down', '...accelerate', '...move at a constant velocity'],
        correctAnswer: 3,
      },
      {
        id: 3,
        question: 'If you push a 10kg box with a net force of 50N, what is its acceleration?',
        options: ['5 m/s²', '0.2 m/s²', '500 m/s²', '10 m/s²'],
        correctAnswer: 0,
      },
    ],
  },
  '3': {
    id: '3',
    title: 'Human Evolution Check',
    subject: 'Life Sciences',
    difficulty: 'Grade 12',
    type: 'tutorial',
    description: 'A quick check on the Human Evolution tutorial.',
    duration: '5 min',
    questions: [
      {
        id: 1,
        question: 'A phylogenetic tree is a diagram that shows...',
        options: [
          '...family relationships',
          '...evolutionary relationships between species',
          '...food webs',
          '...anatomical diagrams',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        question: 'Which anatomical feature is a key indicator of bipedalism in a hominid skull?',
        options: [
          'Large canine teeth',
          'A prominent brow ridge',
          'A foramen magnum at the back of the skull',
          'A foramen magnum at the base of the skull',
        ],
        correctAnswer: 3,
      },
      {
        id: 3,
        question: 'The "Out of Africa" hypothesis suggests that modern humans...',
        options: [
          '...evolved in Africa and then migrated to other continents',
          '...evolved separately in many different continents',
          '...migrated from Europe to Africa',
          '...co-existed with dinosaurs in Africa',
        ],
        correctAnswer: 0,
      },
    ],
  },
  '4': {
    id: '4',
    title: 'Atmosphere Check',
    subject: 'Geography',
    difficulty: 'Grade 10',
    type: 'tutorial',
    description: 'A quick check on the Atmosphere tutorial.',
    duration: '5 min',
    questions: [
      {
        id: 1,
        question: 'Which layer of the atmosphere do we live in and where does most weather occur?',
        options: ['Stratosphere', 'Troposphere', 'Mesosphere', 'Thermosphere'],
        correctAnswer: 1,
      },
      {
        id: 2,
        question: 'The ozone layer, which absorbs harmful UV radiation, is found in the:',
        options: ['Troposphere', 'Exosphere', 'Stratosphere', 'Mesosphere'],
        correctAnswer: 2,
      },
      {
        id: 3,
        question: "What is the most abundant gas in the Earth's atmosphere?",
        options: ['Oxygen', 'Carbon Dioxide', 'Argon', 'Nitrogen'],
        correctAnswer: 3,
      },
    ],
  },
  '5': {
    id: '5',
    title: 'Accounting Equation Check',
    subject: 'Accounting',
    difficulty: 'Grade 10',
    type: 'tutorial',
    description: 'A quick check on the Accounting Equation tutorial.',
    duration: '5 min',
    questions: [
      {
        id: 1,
        question: 'What is the correct basic accounting equation?',
        options: [
          'Assets = Liabilities - Owners Equity',
          'Owners Equity = Assets + Liabilities',
          'Assets = Owners Equity + Liabilities',
          'Liabilities = Assets + Owners Equity',
        ],
        correctAnswer: 2,
      },
      {
        id: 2,
        question: 'A vehicle bought by the business is an example of a(n):',
        options: ['Asset', 'Liability', 'Income', 'Expense'],
        correctAnswer: 0,
      },
      {
        id: 3,
        question: 'If a business takes a loan from the bank, what is the effect on the equation?',
        options: [
          'Assets decrease, Liabilities decrease',
          'Assets increase, Liabilities increase',
          'Assets increase, Owners Equity increases',
          'Liabilities increase, Owners Equity decreases',
        ],
        correctAnswer: 1,
      },
    ],
  },
  '6': {
    id: '6',
    title: 'Macbeth Summary Check',
    subject: 'English',
    difficulty: 'Grade 12',
    type: 'tutorial',
    description: 'A quick check on the Macbeth summary tutorial.',
    duration: '5 min',
    questions: [
      {
        id: 1,
        question: "What is the witches' prophecy for Macbeth at the beginning of the play?",
        options: [
          'He will be Thane of Fife',
          'He will be Thane of Cawdor and King',
          'He will be killed by Banquo',
          'He will have many sons',
        ],
        correctAnswer: 1,
      },
      {
        id: 2,
        question: 'A major theme in the play is "fair is foul, and foul is fair," which relates to:',
        options: ['...Appearance vs. Reality', '...Love and Friendship', '...Man vs. Nature', '...Justice and Revenge'],
        correctAnswer: 0,
      },
      {
        id: 3,
        question: 'Who does Macbeth frame for the murder of King Duncan?',
        options: ['Macduff', 'Banquo', "Duncan's sons (Malcolm and Donalbain)", "Duncan's guards"],
        correctAnswer: 3,
      },
      {
        id: 4,
        question: 'Why is Macduff able to kill Macbeth, despite the prophecy "none of woman born shall harm Macbeth"?',
        options: ['He is a ghost', 'He was born via Caesarean section', 'He is not a man', 'The witches lied'],
        correctAnswer: 1,
      },
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
