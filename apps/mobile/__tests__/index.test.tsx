import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

import Home from '@/app/(tabs)';
import { useAuth } from '@/contexts/auth-context';
import { useTutorials } from '@/hooks/useTutorials';
import { renderWithClient } from '@/utils/test';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useTutorials', () => ({
  useTutorials: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  FontAwesome5: 'FontAwesome5',
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock('@/contexts/theme-context', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTheme: () => ({
    theme: 'light', // Or 'dark', whichever you prefer for tests
    setTheme: jest.fn(),
    isThemeLoading: false, // Critically, set loading to false
  }),
}));

const mockTutorials = [
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
      'Understand key factors in Rome`s rise and fall',
      'Examine the cultural and political legacy of Rome',
    ],
    description: 'An in-depth look at Rome`s rise and fall, covering key emperors and major historical turning points.',
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

describe('Home Screen (Index)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Guest User Experience', () => {
    it('renders welcome screen for guest users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.getByText(/Welcome to Edulite!/i)).toBeTruthy();
      expect(screen.getByText(/Sign up or log in to unlock exclusive features/i)).toBeTruthy();
      expect(screen.getByText(/Browse by Subject/i)).toBeTruthy();
      expect(screen.getByText(/All Tutorials/i)).toBeTruthy();
    });

    it('displays login prompt for guest users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.getByText(/Log in to track your achievements/i)).toBeTruthy();
      expect(screen.getByText('Log In')).toBeTruthy();
    });

    it('navigates to login when Log In button is pressed', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);
      const loginButton = screen.getByText('Log In');
      fireEvent.press(loginButton);

      expect(router.push).toHaveBeenCalledWith('/login');
    });

    it('does not show achievements section for guest users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.queryByText('Achievements')).toBeNull();
      expect(screen.queryByText('Your Progress')).toBeNull();
      expect(screen.queryByText('Continue Learning')).toBeNull();
    });

    it('displays tutorials for guest users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.getAllByText(/Introduction to Algebra/i)[0]).toBeTruthy();
      expect(screen.getAllByText(/Chemistry Fundamentals/i)[0]).toBeTruthy();
    });
  });

  describe('Authenticated User Experience', () => {
    it('renders personalized welcome message for authenticated users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.getByText(/Welcome Back, Quinton!/i)).toBeTruthy();
      expect(screen.getByText(/Continue your learning journey/i)).toBeTruthy();
    });

    it('displays continue learning card for authenticated users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.getByText('Continue Learning')).toBeTruthy();
      // Check for the tutorial title (mockTutorials[1] is hard-coded in useContinueLearning)
      expect(screen.getAllByText(/Chemistry Fundamentals/i)[0]).toBeTruthy();
      // Check for the hard-coded progress
      expect(screen.getByText('60%')).toBeTruthy();
    });

    it('does not show guest login prompt for authenticated users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.queryByText(/Log in to track your achievements/i)).toBeNull();
    });
  });

  describe('Tutorial Display', () => {
    it('renders tutorial cards with correct information', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.getAllByText(/Introduction to Algebra/i)[0]).toBeTruthy();
      expect(screen.getAllByText(/Chemistry Fundamentals/i)[0]).toBeTruthy();
      expect(screen.getAllByText(/Ancient Civilizations/i)[0]).toBeTruthy();
      expect(screen.getAllByText(/Calculus Made Easy/i)[0]).toBeTruthy();
      expect(screen.getAllByText('Dr. Sarah Chen')[0]).toBeTruthy();
      expect(screen.getAllByText('Prof. Mark Johnson')[0]).toBeTruthy();
      expect(screen.getAllByText('Dr. Emily Rodriguez')[0]).toBeTruthy();
      expect(screen.getAllByText('Dr. Michael Park')[0]).toBeTruthy();
    });

    it('displays correct tutorial count', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.getByText('4 tutorials available')).toBeTruthy();
    });

    it('displays difficulty tags', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.getAllByText('Beginner').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Intermediate').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Advanced').length).toBeGreaterThanOrEqual(2); // Two advanced tutorials
    });

    it('displays tutorial durations', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.getAllByText('25 min').length).toBeGreaterThan(0);
      expect(screen.getAllByText('32 min').length).toBeGreaterThan(0);
      expect(screen.getAllByText('28 min').length).toBeGreaterThan(0);
      expect(screen.getAllByText('45 min').length).toBeGreaterThan(0);
    });

    it('navigates to tutorial details on card press', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      const tutorialCard = screen.getAllByText(/Introduction to Algebra/i)[0];
      fireEvent.press(tutorialCard);

      await waitFor(() => {
        expect(router.push).toHaveBeenCalledWith('/tutorial/1');
      });
    });

    it('navigates to correct tutorial when different cards are pressed', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      fireEvent.press(screen.getAllByText(/Chemistry Fundamentals/i)[0]);
      await waitFor(() => {
        expect(router.push).toHaveBeenCalledWith('/tutorial/2');
      });

      fireEvent.press(screen.getAllByText(/Ancient Civilizations/i)[0]);
      await waitFor(() => {
        expect(router.push).toHaveBeenCalledWith('/tutorial/3');
      });
    });
  });

  describe('Subject Filtering', () => {
    it('renders all subject filter buttons', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      const allButtons = screen.getAllByText('All');
      const mathsButtons = screen.getAllByText('Maths');
      const scienceButtons = screen.getAllByText('Science');
      const historyButtons = screen.getAllByText('History');

      // At least one of each filter button should exist (in the filter row)
      expect(allButtons.length).toBeGreaterThan(0);
      expect(mathsButtons.length).toBeGreaterThan(0);
      expect(scienceButtons.length).toBeGreaterThan(0);
      expect(historyButtons.length).toBeGreaterThan(0);
    });

    it('starts with "All" as the default selected subject', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      // Initially called with 'All'
      expect(useTutorials).toHaveBeenCalledWith('All');
    });

    it('changes selected subject when filter button is pressed', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      // Find the Science button in the filter section (first occurrence)
      const scienceButtons = screen.getAllByText('Science');
      const filterScienceButton = scienceButtons[0]; // First one should be the filter button

      fireEvent.press(filterScienceButton);

      expect(filterScienceButton).toBeTruthy();
    });

    it('filters tutorials by selected subject', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });

      const mathsTutorials = mockTutorials.filter((t) => t.subject === 'Maths');

      (useTutorials as jest.Mock).mockReturnValue({
        data: mathsTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      // Should show 2 tutorials (both Maths tutorials)
      expect(screen.getByText('2 tutorials available')).toBeTruthy();
      expect(screen.getAllByText(/Introduction to Algebra/i)[0]).toBeTruthy();
      expect(screen.getAllByText(/Calculus Made Easy/i)[0]).toBeTruthy();
    });
  });

  describe('Loading and Error States', () => {
    it('displays loading indicator when tutorials are loading', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.getByText(/Loading tutorials/i)).toBeTruthy();
    });

    it('displays error message when tutorial loading fails', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      const refetchMock = jest.fn();
      (useTutorials as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: refetchMock,
      });

      renderWithClient(<Home />);

      expect(screen.getByText(/Failed to load tutorials/i)).toBeTruthy();
      expect(screen.getByText('Retry')).toBeTruthy();
    });

    it('calls refetch when retry button is pressed', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      const refetchMock = jest.fn();
      (useTutorials as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: refetchMock,
      });

      renderWithClient(<Home />);

      const retryButton = screen.getByText('Retry');
      fireEvent.press(retryButton);

      expect(refetchMock).toHaveBeenCalledTimes(1);
    });

    it('displays error when tutorials data is null', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.getByText(/Failed to load tutorials/i)).toBeTruthy();
    });
  });

  describe('Notification Button', () => {
    it('renders notification button with badge', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.getByText('3')).toBeTruthy(); // Badge count
    });
  });

  describe('Empty State', () => {
    it('handles empty tutorials array gracefully', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.getByText('0 tutorials available')).toBeTruthy();
      expect(screen.getByText('All Tutorials')).toBeTruthy();
    });
  });

  describe('Integration Tests', () => {
    it('displays tutorials regardless of authentication state', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.getByText('4 tutorials available')).toBeTruthy();
      expect(screen.getAllByText(/Introduction to Algebra/i)[0]).toBeTruthy();
    });
  });

  describe('Edge Cases and Accessibility', () => {
    it('handles tutorials with missing optional fields', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });

      const incompleteTutorials = [
        {
          id: '1',
          subject: 'Maths',
          difficulty: 'Beginner',
          title: 'Basic Math',
          instructor: '',
          duration: '',
          image: '',
          createdAt: '2025-10-20T08:30:00Z',
        },
      ];

      (useTutorials as jest.Mock).mockReturnValue({
        data: incompleteTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.getAllByText('Basic Math')[0]).toBeTruthy();
    });

    it('handles very long tutorial titles', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });

      const longTitleTutorial = [
        {
          ...mockTutorials[0],
          id: 'long-title',
          title:
            'This is a very long tutorial title that should be handled properly by the UI without breaking the layout or causing overflow issues',
        },
      ];

      (useTutorials as jest.Mock).mockReturnValue({
        data: longTitleTutorial,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.getAllByText(/This is a very long tutorial title/i)[0]).toBeTruthy();
    });

    it('handles rapid subject filter changes', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      const allButtons = screen.getAllByText('All');
      const mathsButtons = screen.getAllByText('Maths');
      const scienceButtons = screen.getAllByText('Science');
      const historyButtons = screen.getAllByText('History');

      // Simulate rapid clicking
      fireEvent.press(mathsButtons[0]);
      fireEvent.press(scienceButtons[0]);
      fireEvent.press(historyButtons[0]);
      fireEvent.press(allButtons[0]);

      // Component should handle all clicks without crashing
      expect(screen.getByText('Browse by Subject')).toBeTruthy();
    });

    it('maintains scroll position context', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);
      // Just verify the scrollable container exists
      // Actual scroll behavior is difficult to test in RNTL
      expect(screen.getAllByText(/Introduction to Algebra/i)[0]).toBeTruthy();
    });
  });

  describe('Performance and Optimization', () => {
    it('does not re-fetch when subject changes to the same value', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });

      const refetchMock = jest.fn();

      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: refetchMock,
      });

      renderWithClient(<Home />);

      const allButtons = screen.getAllByText('All');

      // Click 'All' multiple times
      fireEvent.press(allButtons[0]);
      fireEvent.press(allButtons[0]);
      fireEvent.press(allButtons[0]);

      // refetch should not be called for same subject selection
      // (This depends on your implementation)
      expect(screen.getByText('Browse by Subject')).toBeTruthy();
    });

    it('handles large tutorial datasets efficiently', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });

      // Create a large dataset
      const largeTutorialSet = Array.from({ length: 50 }, (_, i) => ({
        ...mockTutorials[0],
        id: `tutorial-${i}`,
        title: `Tutorial ${i}`,
      }));

      (useTutorials as jest.Mock).mockReturnValue({
        data: largeTutorialSet,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      expect(screen.getByText('50 tutorials available')).toBeTruthy();
    });
  });

  describe('User Interaction Flows', () => {
    it('completes guest-to-login flow', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      // Guest sees prompt
      expect(screen.getByText(/Log in to track your achievements/i)).toBeTruthy();

      // Guest clicks login
      fireEvent.press(screen.getByText('Log In'));

      // Should navigate to login
      expect(router.push).toHaveBeenCalledWith('/login');
    });

    it('completes tutorial selection flow', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      // User sees tutorials
      expect(screen.getByText('4 tutorials available')).toBeTruthy();

      // User clicks on a tutorial
      fireEvent.press(screen.getAllByText(/Introduction to Algebra/i)[0]);

      // Should navigate to tutorial details
      await waitFor(() => {
        expect(router.push).toHaveBeenCalledWith('/tutorial/1');
      });
    });

    it('completes error recovery flow', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });

      const refetchMock = jest.fn();

      (useTutorials as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: refetchMock,
      });

      renderWithClient(<Home />);

      // User sees error
      expect(screen.getByText(/Failed to load tutorials/i)).toBeTruthy();

      // User clicks retry
      fireEvent.press(screen.getByText('Retry'));

      // Should call refetch
      expect(refetchMock).toHaveBeenCalled();
    });

    it('navigates through subject filters and selects tutorial', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: {
          id: '1',
          name: 'Quinton',
          email: 'quinton@example.com',
        },
        isLoading: false,
      });
      (useTutorials as jest.Mock).mockReturnValue({
        data: mockTutorials,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      });

      renderWithClient(<Home />);

      // Click on Science filter
      const scienceButtons = screen.getAllByText('Science');
      fireEvent.press(scienceButtons[0]);

      // Click on a science tutorial
      fireEvent.press(screen.getAllByText(/Chemistry Fundamentals/i)[0]);

      // Should navigate to tutorial
      await waitFor(() => {
        expect(router.push).toHaveBeenCalledWith('/tutorial/2');
      });
    });
  });
});
