// Import polyfills first
import '../polyfills';

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';
import { FeedbackService } from '../src/services/FeedbackService';
import { NotificationService } from '../src/services/NotificationService';
import { DeepLinkService } from '../src/services/DeepLinkService';
import { CacheService } from '../src/services/CacheService';
import { Onboarding } from '../src/components/Onboarding';
import { OfflineIndicator } from '../src/components/OfflineIndicator';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { PerformanceMonitor } from '../src/utils/PerformanceMonitor';

function RootLayoutNav() {
  const { isDark } = useTheme();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize all services on app start
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize feedback service
      FeedbackService.init();
      
      // Check if first launch
      const onboardingComplete = await AsyncStorage.getItem('@inv_onboarding_complete');
      if (!onboardingComplete) {
        setShowOnboarding(true);
      }
      
      // Request notification permissions and schedule reminders
      const notificationGranted = await NotificationService.requestPermissions();
      if (notificationGranted) {
        console.log('Notifications enabled');
        // Schedule daily reminder (default 7 AM)
        await NotificationService.scheduleDailyReminder(7, 0);
        // Schedule weekly summary
        await NotificationService.scheduleWeeklySummary(0, 0);
      }
      
      // Set up deep link handling
      const subscription = DeepLinkService.subscribe((data) => {
        console.log('Deep link received:', data);
        
        switch (data.type) {
          case 'referral':
            if (data.code) {
              DeepLinkService.handleReferral(data.code);
            }
            break;
          case 'run':
            // Navigate to run details
            break;
          case 'profile':
            // Navigate to profile
            break;
          case 'leaderboard':
            // Navigate to leaderboard
            break;
        }
      });
      
      // Check for pending referral on startup
      DeepLinkService.checkPendingReferral().then(code => {
        if (code) {
          console.log('Pending referral code:', code);
          // Show referral modal or apply code
        }
      });
      
      return () => {
        subscription.remove();
        CacheService.clearMemoryCache();
      };
    } catch (error) {
      console.log('App initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (isLoading) {
    return null; // Or a splash screen
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }
  
  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <OfflineIndicator />
      <ErrorBoundary
        screenName="Root Navigation"
        onError={(error, errorInfo) => {
          console.error('Critical error:', error, errorInfo);
        }}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: {
              backgroundColor: isDark ? '#0A0A0F' : '#F8F9FA',
            },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="run" />
          <Stack.Screen name="activity-route" />
          <Stack.Screen name="leaderboard" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="profile/notifications" />
          <Stack.Screen name="referral" />
          <Stack.Screen name="friends" />
        </Stack>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
