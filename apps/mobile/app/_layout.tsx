import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

import { toastConfig } from '@/components/custom-toast';
import AuthProvider from '@/contexts/auth-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60,
          },
        },
      }),
  );

  const [loaded] = useFonts({
    Poppins: require('../assets/fonts/Poppins-SemiBold.ttf'),
    Poppins_Regular: require('../assets/fonts/Poppins-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack>
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="tutorial/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="edit-account" options={{ headerShown: false }} />
        </Stack>
        <Toast config={toastConfig} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
