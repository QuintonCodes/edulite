import { renderWithClient } from '@/utils/test-utils';
import { screen } from '@testing-library/react-native';
import React from 'react';

import Dashboard from '@/app/(tabs)';

describe('Index screen', () => {
  it('renders the dashboard title', () => {
    renderWithClient(<Dashboard />);
    expect(screen.getByText(/Dashboard/i)).toBeTruthy();
  });

  it('renders tutorial categories', () => {
    renderWithClient(<Dashboard />);
    expect(screen.getByText(/Maths/i)).toBeTruthy();
    expect(screen.getByText(/Science/i)).toBeTruthy();
    expect(screen.getByText(/History/i)).toBeTruthy();
  });
});

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
  FontAwesome5: () => null,
  MaterialCommunityIcons: () => null,
}));
