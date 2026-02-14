/**
 * Lazy Screen Loader
 * Implements code splitting for React Native screens
 * Reduces initial bundle size and improves startup time
 */

import React, { Suspense, lazy, ComponentType, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing } from '../theme/Spacing';
import { Logger } from '../utils/Logger';

interface LazyScreenOptions {
  fallback?: React.ReactNode;
  delay?: number; // Minimum loading time to prevent flash
  onError?: (error: Error) => void;
}

/**
 * Lazy load a screen component with loading state
 */
export function lazyScreen<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyScreenOptions = {}
) {
  const LazyComponent = lazy(importFn);
  const { fallback, delay = 0, onError } = options;

  return function LazyScreenWrapper(props: any) {
    const [isReady, setIsReady] = useState(delay === 0);
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      if (delay > 0) {
        const timer = setTimeout(() => setIsReady(true), delay);
        return () => clearTimeout(timer);
      }
    }, [delay]);

    const handleError = (err: Error) => {
      Logger.error('Lazy screen failed to load:', err);
      setHasError(true);
      setError(err);
      onError?.(err);
    };

    if (hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Failed to load</Text>
          <Text style={styles.errorMessage}>
            {error?.message || 'Please try again'}
          </Text>
        </View>
      );
    }

    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        {isReady && (
          <ErrorBoundary onError={handleError}>
            <LazyComponent {...props} />
          </ErrorBoundary>
        )}
      </Suspense>
    );
  };
}

/**
 * Default loading fallback
 */
function DefaultFallback() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

/**
 * Error boundary for lazy loaded components
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  text: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  errorTitle: {
    ...Typography.h3,
    color: Colors.error,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

/**
 * Preload a screen for faster navigation
 */
export function preloadScreen(importFn: () => Promise<any>) {
  const startTime = performance.now();
  
  importFn()
    .then(() => {
      const duration = performance.now() - startTime;
      Logger.debug(`Screen preloaded in ${duration.toFixed(0)}ms`);
    })
    .catch((error) => {
      Logger.error('Failed to preload screen:', error);
    });
}

/**
 * Hook to preload screens on component mount
 */
export function usePreloadScreens(importFns: Array<() => Promise<any>>) {
  useEffect(() => {
    // Preload after initial render
    const timer = setTimeout(() => {
      importFns.forEach(preloadScreen);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
}

export default lazyScreen;
