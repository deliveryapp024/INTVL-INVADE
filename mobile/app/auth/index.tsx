import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../src/theme/Colors';
import { Typography } from '../../src/theme/Typography';
import { Spacing } from '../../src/theme/Spacing';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { FeedbackService } from '../../src/services/FeedbackService';

export default function AuthLandingScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    FeedbackService.buttonPress('medium');
    router.push('/auth/signup');
  };

  const handleSignIn = () => {
    FeedbackService.lightTap();
    router.push('/auth/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Gradient Effect */}
      <View style={styles.backgroundGradient} />

      {/* Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Icon name="map" size={64} color={Colors.textInverse} />
          </View>
          <Text style={styles.appName}>INVADE</Text>
          <Text style={styles.tagline}>Capture Zones. Conquer Territory.{'\n'}Run Your World.</Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name="location" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.featureText}>Capture real-world zones</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name="trophy" size={20} color={Colors.warning} />
            </View>
            <Text style={styles.featureText}>Compete with friends</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name="run-fast" size={20} color={Colors.success} />
            </View>
            <Text style={styles.featureText}>Track your fitness journey</Text>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signInContainer}
            onPress={handleSignIn}
          >
            <Text style={styles.signInText}>Already have an account? </Text>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text 
              style={styles.termsLink}
              onPress={() => router.push('/terms')}
            >
              Terms
            </Text>
            {' '}and{' '}
            <Text 
              style={styles.termsLink}
              onPress={() => router.push('/privacy')}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: Spacing['2xl'],
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.textInverse,
    letterSpacing: 4,
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginVertical: Spacing.xl,
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: Spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureText: {
    ...Typography.body,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  getStartedButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    ...Typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  signInLink: {
    ...Typography.body,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  termsContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  termsText: {
    ...Typography.caption,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  termsLink: {
    color: Colors.textInverse,
    fontWeight: '600',
  },
});
