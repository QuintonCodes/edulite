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
          marginHorizontal: 20,
          bottom: 28,
          left: 20,
          right: 20,
          borderRadius: 30,
          height: 75,
          overflow: 'hidden',
          borderWidth: 0.5,
          borderColor: 'rgba(0, 0, 0, 0.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          elevation: 0,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 8,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        },
        tabBarBackground: () => (
          <BlurView intensity={Platform.OS === 'ios' ? 50 : 70} tint="light" style={{ flex: 1 }} />
        ),
        tabBarActiveTintColor: '#1f5da2',
        tabBarInactiveTintColor: '#9ca3af',
        sceneStyle: { backgroundColor: '#f9fafb' },
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

      {/* Tutorials */}
      <Tabs.Screen
        name="tutorials"
        options={{
          title: 'Tutorials',
          tabBarIcon: ({ color, focused }) => <TabItem icon="book" label="Tutorials" color={color} focused={focused} />,
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
