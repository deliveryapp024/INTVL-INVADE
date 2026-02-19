// Import polyfills first
import '../polyfills';

import { useEffect, useState, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { FeedbackService } from '../src/services/FeedbackService';
import { NotificationService } from '../src/services/NotificationService';
import { DeepLinkService } from '../src/services/DeepLinkService';
import authService from '../src/services/authService';
import { CacheService } from '../src/services/CacheService';
import { pushTokenService } from '../src/services/PushTokenService';
import { Onboarding } from '../src/components/Onboarding';
import { OfflineIndicator } from '../src/components/OfflineIndicator';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { View, ActivityIndicator, AppState } from 'react-native';
import { Colors } from '../src/theme/Colors';

// Auth guard component to handle routing based on auth state
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    if (isLoading || hasNavigated) return;

    const inAuthGroup = segments[0] === 'auth' || segments[0]?.startsWith('auth/');
    const inTermsGroup = segments[0] === 'terms' || segments[0] === 'privacy';

    if (!isAuthenticated && !inAuthGroup && !inTermsGroup) {
      // Redirect to auth landing if not authenticated
      router.replace('/auth');
      setHasNavigated(true);
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home (tabs) if authenticated and trying to access auth screens
      router.replace('/(tabs)');
      setHasNavigated(true);
    }
  }, [isAuthenticated, isLoading, segments, hasNavigated]);

  // Register push token when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      pushTokenService.registerForUser(user.id);
    }
  }, [isAuthenticated, user?.id]);

  return <>{children}</>;
}

function RootLayoutNav() {
  const { isDark } = useTheme();
  const { isLoading: authLoading, isAuthenticated, refreshUser } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const appState = useRef(AppState.currentState);
  
  // Initialize all services on app start
  useEffect(() => {
    initializeApp();
  }, []);

  // Check for auth session when app comes back from background (for OAuth flows)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App came to foreground - checking for auth session...');
        // Refresh user data in case OAuth just completed
        refreshUser();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [refreshUser]);

  const initializeApp = async () => {
    try {
      // Initialize feedback service
      FeedbackService.init();
      
      // Check if first launch
      const onboardingComplete = await AsyncStorage.getItem('@inv_onboarding_complete');
      if (!onboardingComplete && !isAuthenticated) {
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
      
      // Setup push notification listeners (async)
      let notificationSubscription = { remove: () => {} };
      try {
        notificationSubscription = await pushTokenService.setupNotificationListeners(
          (notification) => {
            console.log('Push notification received:', notification);
            // Handle notification data
            if (notification.request?.content?.data) {
              pushTokenService.handleNotificationData(notification.request.content.data);
            }
          },
          (response) => {
            console.log('Push notification tapped:', response);
            const data = response.notification?.request?.content?.data;
            // Handle navigation based on notification type
            if (data?.type === 'achievement_unlocked') {
              router.push('/profile');
            } else if (data?.type === 'friend_activity') {
              router.push('/friends');
            }
          }
        );
      } catch (e) {
        console.log('Push notifications not available in Expo Go');
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
          case 'auth':
            // Handle OAuth callback
            if (data.access_token && data.refresh_token) {
              console.log('Auth callback received, handling OAuth...');
              // Handle the OAuth callback to set session and create profile
              authService.handleOAuthCallback(data.access_token, data.refresh_token)
                .then((result: { error?: Error }) => {
                  if (result.error) {
                    console.error('OAuth callback error:', result.error);
                  } else {
                    console.log('OAuth callback successful');
                    // Auth state change will handle navigation
                  }
                });
            }
            break;
          case 'run':
            router.push('/run');
            break;
          case 'profile':
            router.push('/profile');
            break;
          case 'leaderboard':
            router.push('/leaderboard');
            break;
        }
      });
      
      // Check for pending referral on startup
      DeepLinkService.checkPendingReferral().then(code => {
        if (code) {
          console.log('Pending referral code:', code);
        }
      });
      
      return () => {
        subscription.remove();
        notificationSubscription.remove();
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

  // Show loading screen while initializing
  if (isLoading || authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Show onboarding for first-time users
  if (showOnboarding && !isAuthenticated) {
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
        <AuthGuard>
          {isAuthenticated ? (
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: {
                  backgroundColor: isDark ? '#0A0A0F' : '#F8F9FA',
                },
              }}
            >
              {/* Main Tab Navigation */}
              <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
              
              {/* Full Screen Modals */}
              <Stack.Screen name="run" options={{ presentation: 'fullScreenModal' }} />
              <Stack.Screen name="activity-route" />
              <Stack.Screen name="leaderboard" />
              <Stack.Screen name="referral" />
              <Stack.Screen name="terms" />
              <Stack.Screen name="privacy" />
            </Stack>
          ) : (
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: {
                  backgroundColor: isDark ? '#0A0A0F' : '#F8F9FA',
                },
              }}
            >
              {/* Auth Screens */}
              <Stack.Screen name="auth" options={{ animation: 'fade' }} />
              <Stack.Screen name="auth/login" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="auth/signup" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="auth/forgot-password" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="terms" />
              <Stack.Screen name="privacy" />
            </Stack>
          )}
        </AuthGuard>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}
