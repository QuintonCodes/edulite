export const lightColors = {
  // Backgrounds
  background: '#f9fafb',
  primary: '#ffffff',
  secondary: '#f3f4f6',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textHeader: '#1976d2', // The blue header text
  textOnAccent: '#ffffff', // Text on top of the accent color

  // Accents & Brand
  accent: '#3b82f6', // Main interactive blue from profile.tsx
  accentLight: '#eff6ff',

  // Borders & Dividers
  border: '#e5e7eb',

  // Status Colors
  success: '#10b981',
  danger: '#ef4444',
  dangerBg: '#ffebee',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Role Colors (from profile)
  roleStudent: '#3b82f6',
  roleTeacher: '#8b5cf6',
  roleAdmin: '#ef4444',

  // Components
  switchTrack: '#D1D5DB',
  switchTrackActive: '#3b82f6',
  switchThumb: '#ffffff',
  avatarButton: '#3b82f6',
  avatarButtonText: '#ffffff',
  xpBar: '#3b82f6',

  // Tab Bar colors
  tabBarBackground: 'rgba(255, 255, 255, 0.6)',
  tabBarBorder: 'rgba(0, 0, 0, 0.1)',
  tabBarActiveTint: '#1f5da2',
  tabBarInactiveTint: '#9ca3af',
};

export const darkColors: Colors = {
  // Backgrounds
  background: '#121212',
  primary: '#1e1e1e',
  secondary: '#334155',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  textHeader: '#64b5f6', // Lighter blue for dark bg
  textOnAccent: '#121212', // Dark text on light accent

  // Accents & Brand
  accent: '#64b5f6', // Lighter, accessible blue
  accentLight: '#2a2a2a', // Dark background for icons

  // Borders & Dividers
  border: '#3a3a3a',

  // Status Colors
  success: '#22c55e',
  danger: '#f87171',
  dangerBg: '#2f2020',
  warning: '#fbbf24',
  info: '#60a5fa',

  // Role Colors
  roleStudent: '#64b5f6',
  roleTeacher: '#c0a0ff', // Lighter purple
  roleAdmin: '#ff8a80',

  // Components
  switchTrack: '#3a3a3a',
  switchTrackActive: '#64b5f6',
  switchThumb: '#ffffff',
  avatarButton: '#64b5f6',
  avatarButtonText: '#121212',
  xpBar: '#64b5f6',

  // Tab Bar colors
  tabBarBackground: 'rgba(30, 41, 59, 0.8)',
  tabBarBorder: 'rgba(255, 255, 255, 0.1)',
  tabBarActiveTint: '#60a5fa',
  tabBarInactiveTint: '#64748b',
};

// Define a type for the color palette for TypeScript
export type Colors = typeof lightColors;
