export const achievementData = [
  {
    id: '1',
    icon: { name: 'trophy', library: 'FontAwesome5', color: '#facc15' },
    title: 'First Steps',
    subtitle: 'Complete your first tutorial',
    earned: true,
  },
  {
    id: '2',
    icon: { name: 'flame', library: 'Ionicons', color: '#ef4444' },
    title: 'Week Streak',
    subtitle: 'Study for 7 consecutive days',
    earned: true,
  },
  {
    id: '3',
    icon: { name: 'lightbulb-on', library: 'MaterialCommunityIcons', color: '#fbbf24' },
    title: 'Subject Master',
    subtitle: 'Complete 5 tutorials in one subject',
    earned: true,
  },
  {
    id: '4',
    icon: { name: 'flash', library: 'Ionicons', color: '#3b82f6' },
    title: 'Speed Learner',
    subtitle: 'Complete a tutorial in under 20 min',
    earned: false,
  },
];

export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
};

export const sampleQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'What was the main topic covered in this tutorial?',
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
    correctAnswer: 0,
  },
  {
    id: 2,
    question: 'Which of the following is a key concept?',
    options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'],
    correctAnswer: 1,
  },
  {
    id: 3,
    question: 'How would you apply what you learned?',
    options: ['Application 1', 'Application 2', 'Application 3', 'Application 4'],
    correctAnswer: 2,
  },
];
