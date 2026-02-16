import React, { useState, useEffect } from 'react';
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
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { Colors } from '../../src/theme/Colors';
import { Typography } from '../../src/theme/Typography';
import { Spacing } from '../../src/theme/Spacing';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { useAuth } from '../../src/context/AuthContext';
import { FeedbackService } from '../../src/services/FeedbackService';
import { supabase } from '../../src/lib/supabase';

interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  username: string;
  dateOfBirth: Date | null;
  phone: string;
  locationCity: string;
  locationCountry: string;
  latitude: number | null;
  longitude: number | null;
  termsAccepted: boolean;
}

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  
  const [data, setData] = useState<SignupData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    username: '',
    dateOfBirth: null,
    phone: '',
    locationCity: '',
    locationCountry: '',
    latitude: null,
    longitude: null,
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SignupData, string>>>({});

  const totalSteps = 4;

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof SignupData, string>> = {};

    switch (step) {
      case 1:
        if (!data.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          newErrors.email = 'Please enter a valid email';
        }
        if (!data.password) {
          newErrors.password = 'Password is required';
        } else if (data.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(data.password)) {
          newErrors.password = 'Password must contain uppercase, number, and special character';
        }
        if (data.password !== data.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;

      case 2:
        if (!data.name.trim()) {
          newErrors.name = 'Full name is required';
        }
        if (!data.username.trim()) {
          newErrors.username = 'Username is required';
        } else if (data.username.length < 3 || data.username.length > 20) {
          newErrors.username = 'Username must be 3-20 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
          newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }
        break;

      case 3:
        if (!data.locationCity.trim() && !data.locationCountry.trim() && !data.latitude) {
          newErrors.locationCity = 'Please provide your location';
        }
        break;

      case 4:
        if (!data.termsAccepted) {
          newErrors.termsAccepted = 'You must accept the Terms and Privacy Policy';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) return;
    
    setIsCheckingUsername(true);
    try {
      const { data: existing } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();
      
      if (existing) {
        setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
      }
    } catch {
      // Username is available
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const detectLocation = async () => {
    setIsLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions to auto-detect your location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocode to get city and country
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      setData(prev => ({
        ...prev,
        latitude,
        longitude,
        locationCity: address.city || address.subregion || '',
        locationCountry: address.country || '',
      }));

      FeedbackService.success();
    } catch (error) {
      Alert.alert('Error', 'Failed to detect location. Please enter manually.');
      FeedbackService.error();
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      FeedbackService.error();
      return;
    }

    FeedbackService.buttonPress('light');

    if (currentStep === 2 && data.username) {
      await checkUsernameAvailability(data.username);
      if (errors.username) return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSignup();
    }
  };

  const handleBack = () => {
    FeedbackService.lightTap();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSignup = async () => {
    setIsLoading(true);
    FeedbackService.buttonPress('medium');

    try {
      const signupData = {
        email: data.email.trim(),
        password: data.password,
        name: data.name.trim(),
        username: data.username.trim(),
        date_of_birth: data.dateOfBirth?.toISOString().split('T')[0],
        phone: data.phone.trim() || undefined,
        location_city: data.locationCity.trim() || undefined,
        location_country: data.locationCountry.trim() || undefined,
        latitude: data.latitude || undefined,
        longitude: data.longitude || undefined,
      };

      const { error } = await signUp(signupData as any);

      if (error) {
        Alert.alert('Signup Failed', error.message || 'Failed to create account. Please try again.');
        FeedbackService.error();
      } else {
        // Record terms acceptance
        await supabase.rpc('record_terms_acceptance', {
          p_terms_version: '1.0',
          p_privacy_version: '1.0',
          p_ip_address: null,
          p_user_agent: null,
        });

        FeedbackService.success();
        Alert.alert(
          'Welcome to INVADE! 🎉',
          'Your account has been created successfully. Please check your email to verify your account.',
          [{ text: 'Get Started', onPress: () => router.replace('/') }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      FeedbackService.error();
    } finally {
      setIsLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setData(prev => ({ ...prev, dateOfBirth: selectedDate }));
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View
            style={[
              styles.stepDot,
              step <= currentStep && styles.stepDotActive,
              step < currentStep && styles.stepDotCompleted,
            ]}
          >
            {step < currentStep ? (
              <Icon name="checkmark" size={12} color={Colors.textInverse} />
            ) : (
              <Text style={[styles.stepNumber, step <= currentStep && styles.stepNumberActive]}>
                {step}
              </Text>
            )}
          </View>
          {step < totalSteps && <View style={styles.stepLine} />}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Create Account</Text>
      <Text style={styles.stepSubtitle}>Let's start with your login details</Text>

      {/* Email */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email Address *</Text>
        <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
          <Icon name="mail" size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={data.email}
            onChangeText={(text) => {
              setData(prev => ({ ...prev, email: text }));
              if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
            }}
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Password */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password *</Text>
        <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
          <Icon name="lock-closed" size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Create a password"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            value={data.password}
            onChangeText={(text) => {
              setData(prev => ({ ...prev, password: text }));
              if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
            }}
          />
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        <Text style={styles.passwordHint}>Min 8 chars, 1 uppercase, 1 number, 1 special char</Text>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Confirm Password *</Text>
        <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
          <Icon name="lock-closed" size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            value={data.confirmPassword}
            onChangeText={(text) => {
              setData(prev => ({ ...prev, confirmPassword: text }));
              if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
            }}
          />
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Profile Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about yourself</Text>

      {/* Full Name */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
          <Icon name="person" size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor={Colors.textMuted}
            value={data.name}
            onChangeText={(text) => {
              setData(prev => ({ ...prev, name: text }));
              if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
            }}
          />
        </View>
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      {/* Username */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Username *</Text>
        <View style={[styles.inputWrapper, errors.username && styles.inputError]}>
          <Text style={styles.atSymbol}>@</Text>
          <TextInput
            style={[styles.input, styles.usernameInput]}
            placeholder="Choose a username"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            value={data.username}
            onChangeText={(text) => {
              setData(prev => ({ ...prev, username: text }));
              if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
            }}
          />
          {isCheckingUsername && <ActivityIndicator size="small" color={Colors.primary} />}
        </View>
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
        <Text style={styles.hintText}>3-20 characters, letters, numbers, underscores only</Text>
      </View>

      {/* Date of Birth */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Date of Birth (Optional)</Text>
        <TouchableOpacity
          style={styles.inputWrapper}
          onPress={() => setShowDatePicker(true)}
        >
          <Icon name="calendar" size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <Text style={[styles.input, !data.dateOfBirth && styles.placeholderText]}>
            {data.dateOfBirth ? data.dateOfBirth.toLocaleDateString() : 'Select your date of birth'}
          </Text>
          <Icon name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={data.dateOfBirth || new Date(2000, 0, 1)}
            mode="date"
            display="spinner"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>

      {/* Phone */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
        <View style={styles.inputWrapper}>
          <Icon name="call" size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="+91 9876543210"
            placeholderTextColor={Colors.textMuted}
            keyboardType="phone-pad"
            value={data.phone}
            onChangeText={(text) => setData(prev => ({ ...prev, phone: text }))}
          />
        </View>
        <Text style={styles.hintText}>We'll send a verification code later</Text>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Your Location</Text>
      <Text style={styles.stepSubtitle}>Help us personalize your experience</Text>

      {/* Auto-detect Button */}
      <TouchableOpacity
        style={styles.detectLocationButton}
        onPress={detectLocation}
        disabled={isLocationLoading}
      >
        <Icon name="location" size={24} color={Colors.primary} />
        <View style={styles.detectLocationTextContainer}>
          <Text style={styles.detectLocationTitle}>Use My Current Location</Text>
          <Text style={styles.detectLocationSubtitle}>Auto-detect using GPS</Text>
        </View>
        {isLocationLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Icon name="chevron-forward" size={20} color={Colors.textMuted} />
        )}
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR ENTER MANUALLY</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* City */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>City</Text>
        <View style={styles.inputWrapper}>
          <Icon name="business" size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your city"
            placeholderTextColor={Colors.textMuted}
            value={data.locationCity}
            onChangeText={(text) => setData(prev => ({ ...prev, locationCity: text }))}
          />
        </View>
      </View>

      {/* Country */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Country</Text>
        <View style={styles.inputWrapper}>
          <Icon name="globe" size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your country"
            placeholderTextColor={Colors.textMuted}
            value={data.locationCountry}
            onChangeText={(text) => setData(prev => ({ ...prev, locationCountry: text }))}
          />
        </View>
      </View>

      {errors.locationCity && <Text style={styles.errorText}>{errors.locationCity}</Text>}

      {(data.latitude || data.locationCity) && (
        <View style={styles.locationPreview}>
          <Icon name="location" size={20} color={Colors.success} />
          <Text style={styles.locationPreviewText}>
            {data.locationCity && data.locationCountry
              ? `${data.locationCity}, ${data.locationCountry}`
              : data.latitude
              ? `Location detected (${data.latitude.toFixed(4)}, ${data.longitude?.toFixed(4)})`
              : 'Location set'}
          </Text>
        </View>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review & Confirm</Text>
      <Text style={styles.stepSubtitle}>Please review your information</Text>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Email</Text>
          <Text style={styles.summaryValue}>{data.email}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Name</Text>
          <Text style={styles.summaryValue}>{data.name}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Username</Text>
          <Text style={styles.summaryValue}>@{data.username}</Text>
        </View>

        {data.dateOfBirth && (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Date of Birth</Text>
            <Text style={styles.summaryValue}>{data.dateOfBirth.toLocaleDateString()}</Text>
          </View>
        )}

        {data.phone && (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Phone</Text>
            <Text style={styles.summaryValue}>{data.phone}</Text>
          </View>
        )}

        {(data.locationCity || data.latitude) && (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Location</Text>
            <Text style={styles.summaryValue}>
              {data.locationCity && data.locationCountry
                ? `${data.locationCity}, ${data.locationCountry}`
                : 'GPS Location'}
            </Text>
          </View>
        )}
      </View>

      {/* Terms Checkbox */}
      <TouchableOpacity
        style={styles.termsContainer}
        onPress={() => {
          setData(prev => ({ ...prev, termsAccepted: !prev.termsAccepted }));
          if (errors.termsAccepted) setErrors(prev => ({ ...prev, termsAccepted: undefined }));
        }}
      >
        <View style={[styles.checkbox, data.termsAccepted && styles.checkboxChecked]}>
          {data.termsAccepted && <Icon name="checkmark" size={14} color={Colors.textInverse} />}
        </View>
        <View style={styles.termsTextContainer}>
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text
              style={styles.termsLink}
              onPress={() => router.push('/terms')}
            >
              Terms of Service
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
      </TouchableOpacity>

      {errors.termsAccepted && <Text style={styles.errorText}>{errors.termsAccepted}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.placeholder} />
      </View>

      {renderStepIndicator()}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <View style={styles.buttonContainer}>
          <Button
            title={currentStep === totalSteps ? (isLoading ? 'Creating Account...' : 'Create Account') : 'Continue'}
            variant="primary"
            size="large"
            onPress={handleNext}
            disabled={isLoading}
          />

          {currentStep === 1 && (
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
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
  headerTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  placeholder: {
    width: 44,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepDotCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepNumber: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  stepNumberActive: {
    color: Colors.textInverse,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.xs,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  stepContent: {
    marginTop: Spacing.md,
  },
  stepTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.md,
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
  placeholderText: {
    color: Colors.textMuted,
  },
  errorText: {
    ...Typography.captionSmall,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  passwordHint: {
    ...Typography.captionSmall,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  atSymbol: {
    ...Typography.body,
    color: Colors.textMuted,
    marginRight: Spacing.xs,
  },
  usernameInput: {
    marginRight: Spacing.sm,
  },
  hintText: {
    ...Typography.captionSmall,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  detectLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  detectLocationTextContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  detectLocationTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  detectLocationSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginHorizontal: Spacing.md,
  },
  locationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    borderRadius: 8,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  locationPreviewText: {
    ...Typography.body,
    color: Colors.success,
    marginLeft: Spacing.sm,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryItem: {
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  summaryValue: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: Spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  loginText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  loginLink: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '700',
  },
});
