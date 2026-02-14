/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in child component tree
 * Displays fallback UI instead of crashing
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Icon } from './Icon';
import { Button } from './Button';
import { FadeIn, ScaleIn } from './animations';
import { HapticsPreset } from '../utils/haptics';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing } from '../theme/Spacing';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  screenName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    this.setState({
      error,
      errorInfo,
    });

    // Trigger haptic error feedback
    HapticsPreset.error();

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Send to analytics/monitoring service
    this.reportError(error, errorInfo);
  }

  reportError(error: Error, errorInfo: ErrorInfo) {
    const { screenName } = this.props;
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, Bugsnag, Firebase Crashlytics
      const errorReport = {
        screen: screenName || 'unknown',
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        version: Platform.Version,
      };
      
      console.log('Error report:', errorReport);
    }
  }

  handleReset = () => {
    HapticsPreset.buttonPress();
    this.props.onReset?.();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleShowDetails = () => {
    HapticsPreset.buttonPress();
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { children, fallback, screenName } = this.props;

    if (!hasError) {
      return children;
    }

    // Custom fallback UI
    if (fallback) {
      return fallback;
    }

    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <FadeIn>
            <ScaleIn delay={100}>
              <View style={styles.iconContainer}>
                <Icon name="alert-circle" size={64} color={Colors.error} />
              </View>
            </ScaleIn>

            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.subtitle}>
              Don't worry, your data is safe. Try restarting the screen.
            </Text>

            {screenName && (
              <Text style={styles.screenLabel}>
                Screen: {screenName}
              </Text>
            )}

            <View style={styles.buttonContainer}>
              <Button
                title="Try Again"
                onPress={this.handleReset}
                variant="primary"
                style={styles.button}
              />

              <TouchableOpacity
                onPress={this.handleShowDetails}
                style={styles.detailsButton}
              >
                <Text style={styles.detailsButtonText}>
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </Text>
              </TouchableOpacity>
            </View>

            {showDetails && error && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Error Details:</Text>
                <Text style={styles.errorText}>
                  {error.toString()}
                </Text>
                {errorInfo && (
                  <>
                    <Text style={styles.detailsTitle}>Component Stack:</Text>
                    <Text style={styles.stackText}>
                      {errorInfo.componentStack}
                    </Text>
                  </>
                )}
              </View>
            )}
          </FadeIn>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: 300,
  },
  screenLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.lg,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    minWidth: 200,
    marginBottom: Spacing.md,
  },
  detailsButton: {
    paddingVertical: Spacing.sm,
  },
  detailsButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  detailsContainer: {
    width: '100%',
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  detailsTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  stackText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default ErrorBoundary;
