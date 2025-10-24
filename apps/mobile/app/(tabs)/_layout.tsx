import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 28,
          left: 20,
          right: 20,
          borderRadius: 40,
          height: 52,
          overflow: 'hidden',
          borderWidth: 0.5,
          borderColor: 'rgba(255, 255, 255, 0.15)',
          backgroundColor: 'transparent',
          elevation: 0,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        tabBarBackground: () => (
          <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint="dark" style={{ flex: 1 }} />
        ),
        tabBarActiveTintColor: '#1f5da2',
        tabBarInactiveTintColor: '#b0b0b0',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <TabItem icon="home" label="Home" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <TabItem icon="person" label="Profile" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabItem icon="settings" label="Settings" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

type TabItemProps = {
  icon: any;
  label: string;
  color: string;
  focused: boolean;
};

function TabItem({ icon, label, color, focused }: TabItemProps) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      <Ionicons name={icon} size={22} color={color} />
      <Text
        style={{
          fontSize: 11,
          color,
          fontWeight: focused ? '600' : '400',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
