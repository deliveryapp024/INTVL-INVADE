// app/premium/index.tsx - Premium Subscription Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../src/theme/Colors';
import { Spacing } from '../../src/theme/Spacing';
import { Icon } from '../../src/components/Icon';
import { Card } from '../../src/components/Card';
import { useTheme } from '../../src/theme/ThemeContext';
import { FeedbackService } from '../../src/services/FeedbackService';

const PREMIUM_FEATURES = [
  { icon: 'analytics', title: 'Advanced Analytics', description: 'Heart rate zones, pace analysis' },
  { icon: 'fitness', title: 'Training Plans', description: '5K to Marathon plans' },
  { icon: 'map', title: 'Route Builder', description: 'Create custom routes' },
  { icon: 'shield-checkmark', title: 'Enhanced Safety', description: '24/7 live location' },
  { icon: 'people', title: 'Unlimited Clubs', description: 'Join any clubs' },
  { icon: 'star', title: 'Premium Routes', description: 'Exclusive routes' },
];

export default function PremiumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    await FeedbackService.buttonPress('medium');
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Coming Soon',
        'Payment integration will be available in the next update.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0F' : '#F8F9FA' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Icon name="close" size={24} color={isDark ? '#FFFFFF' : '#1A1A2E'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.premiumBadge}>
          <Icon name="crown" size={48} color="#FFD700" />
          <Text style={styles.premiumTitle}>INVADE Premium</Text>
          <Text style={[styles.premiumSubtitle, { color: isDark ? '#CCCCCC' : '#666666' }]}>
            Unlock your full potential
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
          Premium Features
        </Text>

        <View style={styles.featuresGrid}>
          {PREMIUM_FEATURES.map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <Icon name={feature.icon} size={24} color={Colors.primary} />
              <Text style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                {feature.title}
              </Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </Card>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
          Choose Your Plan
        </Text>

        <View style={styles.plansContainer}>
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <Text style={[styles.planName, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>Monthly</Text>
            <Text style={styles.planPrice}>₹199</Text>
            <Text style={styles.planPeriod}>/month</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardSelected, styles.yearlyPlan]}
            onPress={() => setSelectedPlan('yearly')}
          >
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>SAVE 37%</Text>
            </View>
            <Text style={[styles.planName, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>Yearly</Text>
            <Text style={styles.planPrice}>₹1,499</Text>
            <Text style={styles.planPeriod}>/year</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe} disabled={isLoading}>
          <Text style={styles.subscribeButtonText}>
            {isLoading ? 'Processing...' : 'Start Free Trial'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { paddingHorizontal: Spacing.lg },
  premiumBadge: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  premiumTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFD700',
    marginTop: Spacing.md,
  },
  premiumSubtitle: {
    fontSize: 16,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  featureCard: {
    width: '48%',
    padding: Spacing.md,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  plansContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  planCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  yearlyPlan: { position: 'relative' },
  saveBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: Colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
  },
  planPeriod: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  subscribeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
