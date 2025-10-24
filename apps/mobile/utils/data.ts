import { Achievement } from './types';

export const achievementData: Achievement[] = [
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
