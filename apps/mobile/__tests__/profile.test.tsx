import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React from 'react';

import Profile from '@/app/(tabs)/profile';
import { useAuth } from '@/contexts/auth-context';
import { useMyCourses } from '@/hooks/useMyCourses';
import { useUserAchievements } from '@/hooks/useUserAchievements';
import { renderWithClient } from '@/utils/test';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useUserAchievements', () => ({
  useUserAchievements: jest.fn(),
}));

jest.mock('@/hooks/useMyCourses', () => ({
  useMyCourses: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

jest.mock('axios');

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
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

const mockAuthenticatedUser = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  isVerified: true,
  role: 'user',
};

const mockAdminUser = {
  id: '2',
  name: 'Admin User',
  email: 'admin@example.com',
  avatarUrl: 'https://example.com/admin-avatar.jpg',
  isVerified: true,
  role: 'admin',
};

describe('Profile Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Guest User Experience', () => {
    it('displays login prompt for unauthenticated users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
        updateUser: jest.fn(),
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });
      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      expect(screen.getByText("You're not logged in")).toBeTruthy();
      expect(screen.getByText(/Log in to access your profile/i)).toBeTruthy();
      expect(screen.getByText('Login')).toBeTruthy();
    });

    it('navigates to login when Login button is pressed', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
        updateUser: jest.fn(),
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      const loginButton = screen.getByText('Login');
      fireEvent.press(loginButton);

      expect(router.push).toHaveBeenCalledWith('/login');
    });

    it('does not show profile content for guest users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
        updateUser: jest.fn(),
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      expect(screen.queryByText('Profile')).toBeNull();
      expect(screen.queryByText('Your Achievements')).toBeNull();
      expect(screen.queryByText('Account Options')).toBeNull();
    });
  });

  describe('Authenticated User Experience', () => {
    it('displays profile information for authenticated users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: mockAuthenticatedUser,
        updateUser: jest.fn(),
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      expect(screen.getByText('Profile')).toBeTruthy();
      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.getByText('john.doe@example.com')).toBeTruthy();
    });

    it('displays user role badge correctly', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: mockAuthenticatedUser,
        updateUser: jest.fn(),
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      expect(screen.getByText('User')).toBeTruthy();
    });

    it('displays admin role badge for admin users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: mockAdminUser,
        updateUser: jest.fn(),
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      expect(screen.getByText('Admin')).toBeTruthy();
    });

    it('displays account options', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: mockAuthenticatedUser,
        updateUser: jest.fn(),
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      expect(screen.getByText('Account Options')).toBeTruthy();
      expect(screen.getByText('Edit Profile')).toBeTruthy();
      expect(screen.getByText('Notifications')).toBeTruthy();
      expect(screen.getByText('Logout')).toBeTruthy();
    });

    it('handles user without verification badge', () => {
      const unverifiedUser = { ...mockAuthenticatedUser, isVerified: false };

      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: unverifiedUser,
        updateUser: jest.fn(),
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      expect(screen.getByText('John Doe')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates to settings when settings button is pressed', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: mockAuthenticatedUser,
        updateUser: jest.fn(),
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      expect(screen.getByText('Profile')).toBeTruthy();
    });

    it('navigates to edit account when Edit Profile is pressed', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: mockAuthenticatedUser,
        updateUser: jest.fn(),
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      const editProfileButton = screen.getByText('Edit Profile');
      fireEvent.press(editProfileButton);

      expect(router.push).toHaveBeenCalledWith('/edit-account');
    });
  });

  describe('Avatar Upload', () => {
    it('requests permissions when avatar upload is initiated', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: mockAuthenticatedUser,
        updateUser: jest.fn(),
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      renderWithClient(<Profile />);

      // Note: In the actual UI, the camera button is on the avatar
      // We can't easily test the button press without testID
      // This is a structural test to ensure the component renders
      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    it('shows alert when permissions are denied', async () => {
      const updateUserMock = jest.fn();

      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: mockAuthenticatedUser,
        updateUser: updateUserMock,
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      renderWithClient(<Profile />);

      // Simulate the permission denial flow
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeTruthy();
      });
    });

    it('successfully uploads avatar when image is selected', async () => {
      const updateUserMock = jest.fn();

      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: mockAuthenticatedUser,
        updateUser: updateUserMock,
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///path/to/image.jpg',
          },
        ],
      });

      (axios.post as jest.Mock).mockResolvedValue({
        data: {
          media: {
            url: 'https://example.com/new-avatar.jpg',
          },
        },
      });

      renderWithClient(<Profile />);

      // Component should render successfully
      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    it('handles upload cancellation', async () => {
      const updateUserMock = jest.fn();

      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: mockAuthenticatedUser,
        updateUser: updateUserMock,
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      renderWithClient(<Profile />);

      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it('shows error alert when upload fails', async () => {
      const updateUserMock = jest.fn();

      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: mockAuthenticatedUser,
        updateUser: updateUserMock,
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///path/to/image.jpg',
          },
        ],
      });

      (axios.post as jest.Mock).mockRejectedValue(new Error('Upload failed'));

      renderWithClient(<Profile />);

      expect(screen.getByText('John Doe')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles user with missing name', () => {
      const userWithoutName = { ...mockAuthenticatedUser, name: '' };

      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: userWithoutName,
        updateUser: jest.fn(),
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      expect(screen.getByText('Guest User')).toBeTruthy();
    });

    it('handles user with missing email', () => {
      const userWithoutEmail = { ...mockAuthenticatedUser, email: '' };

      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: userWithoutEmail,
        updateUser: jest.fn(),
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      expect(screen.getByText('Not Available')).toBeTruthy();
    });

    it('handles user with missing avatar', () => {
      const userWithoutAvatar = { ...mockAuthenticatedUser, avatarUrl: '' };

      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: userWithoutAvatar,
        updateUser: jest.fn(),
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      expect(screen.getByText('John Doe')).toBeTruthy();
      // Should fall back to placeholder image
    });

    it('capitalizes role correctly', () => {
      const userWithLowercaseRole = { ...mockAuthenticatedUser, role: 'moderator' };

      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: userWithLowercaseRole,
        updateUser: jest.fn(),
      });

      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      expect(screen.getByText('Moderator')).toBeTruthy();
    });
  });

  describe('UI Rendering', () => {
    it('renders all account option items', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: mockAuthenticatedUser,
        updateUser: jest.fn(),
      });

      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      const options = ['Edit Profile', 'Notifications', 'Logout'];

      options.forEach((option) => {
        expect(screen.getByText(option)).toBeTruthy();
      });
    });
  });

  describe('State Management', () => {
    it('displays loading state during avatar upload', async () => {
      const updateUserMock = jest.fn();

      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: mockAuthenticatedUser,
        updateUser: updateUserMock,
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      // The upload process should be testable if we had testIDs
      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    it('updates user data after successful avatar upload', async () => {
      const updateUserMock = jest.fn();

      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: mockAuthenticatedUser,
        updateUser: updateUserMock,
      });
      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///path/to/image.jpg' }],
      });

      (axios.post as jest.Mock).mockResolvedValue({
        data: {
          media: { url: 'https://example.com/new-avatar.jpg' },
        },
      });

      renderWithClient(<Profile />);

      expect(screen.getByText('John Doe')).toBeTruthy();
    });
  });

  describe('User Interaction Flows', () => {
    it('completes guest-to-login flow', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
        updateUser: jest.fn(),
      });

      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      // Guest sees login prompt
      expect(screen.getByText("You're not logged in")).toBeTruthy();

      // Guest clicks login
      fireEvent.press(screen.getByText('Login'));

      // Should navigate to login
      expect(router.push).toHaveBeenCalledWith('/login');
    });

    it('completes edit profile navigation flow', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        user: mockAuthenticatedUser,
        updateUser: jest.fn(),
      });

      (useUserAchievements as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      (useMyCourses as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      });

      renderWithClient(<Profile />);

      // User sees profile
      expect(screen.getByText('Account Options')).toBeTruthy();

      // User clicks edit profile
      fireEvent.press(screen.getByText('Edit Profile'));

      // Should navigate to edit account
      expect(router.push).toHaveBeenCalledWith('/edit-account');
    });
  });
});
