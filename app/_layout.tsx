import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import {Colors, AppColors} from '@/constants/Colors';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
// import { Slot } from 'expo-router'

import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import {NotificationProvider} from '@/context/NotificationContext';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }), 
})

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!
  if (!publishableKey) {
    throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file')
  }

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Meticula: require('../assets/fonts/Meticula-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <NotificationProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ClerkProvider publishableKey={publishableKey}>
        <ClerkLoaded>
          
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="privacy-policy" options={{headerStyle: {
              backgroundColor: AppColors.OffWhite,
            },
            headerBackTitle: 'Back',
            title: "Privacy Notice",
          }}/>
          </Stack>
          <StatusBar style="auto" />
          
        </ClerkLoaded>
      </ClerkProvider>

    </ThemeProvider>
    </NotificationProvider>
  );
}

