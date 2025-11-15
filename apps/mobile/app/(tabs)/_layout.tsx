import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';

import { useTheme } from '@/contexts/theme-context';
import { darkColors, lightColors } from '@/styles/theme';

export default function TabsLayout() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const tabBarStyle = {
    position: 'absolute' as const,
    marginHorizontal: 20,
    bottom: 28,
    left: 20,
    right: 20,
    borderRadius: 30,
    height: 75,
    overflow: 'hidden' as const,
    borderWidth: 0.5,
    borderColor: colors.tabBarBorder,
    backgroundColor: colors.tabBarBackground,
    elevation: 0,
    shadowColor: theme === 'dark' ? '#ffffff' : '#000000',
    shadowOpacity: theme === 'dark' ? 0.1 : 0.15,
    shadowRadius: 8,
    display: 'flex' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle,
        tabBarBackground: () => (
          <BlurView
            intensity={Platform.OS === 'ios' ? 50 : 70}
            tint={theme === 'dark' ? 'dark' : 'light'}
            style={{ flex: 1 }}
          />
        ),
        tabBarActiveTintColor: colors.tabBarActiveTint,
        tabBarInactiveTintColor: colors.tabBarInactiveTint,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <TabItem icon="home" label="Home" color={color} focused={focused} />,
        }}
      />

      {/* Assessments */}
      <Tabs.Screen
        name="assessments"
        options={{
          title: 'Assessments',
          tabBarIcon: ({ color, focused }) => (
            <TabItem icon="clipboard" label="Assessments" color={color} focused={focused} />
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <TabItem icon="person" label="Profile" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

type TabItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  focused: boolean;
};

function TabItem({ icon, label, color, focused }: TabItemProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      <Ionicons name={icon} size={22} color={color} />
      <Text
        style={{
          fontSize: 11,
          width: '100%',
          textAlign: 'center',
          fontFamily: focused ? 'Poppins' : 'Poppins_Regular',
          color,
          fontWeight: focused ? '600' : '400',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
