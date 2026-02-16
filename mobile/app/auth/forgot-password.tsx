import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../src/theme/Colors';
import { Typography } from '../../src/theme/Typography';
import { Spacing } from '../../src/theme/Spacing';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { useAuth } from '../../src/context/AuthContext';
import { FeedbackService } from '../../src/services/FeedbackService';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    setError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) {
      FeedbackService.error();
      return;
    }

    setIsLoading(true);
    FeedbackService.buttonPress('medium');

    try {
      // TODO: Implement password reset via Supabase
      // const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
      FeedbackService.success();
    } catch (err) {
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
      FeedbackService.error();
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    FeedbackService.lightTap();
    router.back();
  };

  if (isSuccess) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Icon name="mail" size={48} color={Colors.success} />
          </View>
          
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successMessage}>
            We've sent a password reset link to {email}. Please check your inbox and follow the instructions to reset your password.
          </Text>
          
          <Text style={styles.successNote}>
            Didn't receive the email? Check your spam folder or try again.
          </Text>

          <Button
            title="Back to Login"
            variant="primary"
            size="large"
            onPress={navigateToLogin}
            style={styles.backButton}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={navigateToLogin}
          >
            <Icon name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon name="lock-open" size={48} color={Colors.primary} />
          </View>

          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Don't worry! Enter your email address and we'll send you a link to reset your password.
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[styles.inputWrapper, error && styles.inputError]}>
              <Icon name="mail" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError('');
                }}
                editable={!isLoading}
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          {/* Reset Button */}
          <Button
            title={isLoading ? 'Sending...' : 'Send Reset Link'}
            variant="primary"
            size="large"
            onPress={handleResetPassword}
            disabled={isLoading}
            style={styles.resetButton}
          />

          {/* Back to Login */}
          <TouchableOpacity 
            style={styles.backToLoginContainer}
            onPress={navigateToLogin}
          >
            <Icon name="arrow-back" size={16} color={Colors.primary} />
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    height: 56,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    height: '100%',
  },
  errorText: {
    ...Typography.captionSmall,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  resetButton: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  backToLoginText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 24,
  },
  successNote: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: '100%',
  },
});
