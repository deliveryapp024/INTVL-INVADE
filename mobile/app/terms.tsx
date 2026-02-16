import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../src/theme/Colors';
import { Typography } from '../../src/theme/Typography';
import { Spacing } from '../../src/theme/Spacing';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing or using the INVADE mobile application ("App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the App.

INVADE is a location-based fitness application that allows users to track their runs, capture virtual zones, and compete with friends. Your use of the App is subject to these Terms and our Privacy Policy.`
    },
    {
      title: '2. User Accounts',
      content: `To use certain features of the App, you must create an account. You agree to:

• Provide accurate, current, and complete information during registration
• Maintain the security of your account credentials
• Promptly update your account information if it changes
• Accept responsibility for all activities that occur under your account
• Notify us immediately of any unauthorized use of your account

We reserve the right to suspend or terminate accounts that violate these Terms.`
    },
    {
      title: '3. Location Data',
      content: `The App requires access to your device's location services to function properly. By using the App, you consent to:

• Collection of your precise location data during runs
• Storage of your location history for activity tracking
• Display of your location on maps within the App
• Use of location data to determine zone captures

You can disable location services at any time through your device settings, but this will limit the App's functionality.`
    },
    {
      title: '4. User Content',
      content: `You retain ownership of any content you create or upload to the App ("User Content"). By submitting User Content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content within the App.

You agree not to post content that:
• Is illegal, harmful, or offensive
• Infringes on others' intellectual property rights
• Contains personal information of others without consent
• Is spam or unsolicited promotional material`
    },
    {
      title: '5. Acceptable Use',
      content: `You agree to use the App only for lawful purposes and in accordance with these Terms. Prohibited activities include:

• Using the App while driving or in unsafe conditions
• Attempting to interfere with the App's security or functionality
• Using automated systems to access the App
• Impersonating other users or entities
• Collecting data about other users without consent
• Engaging in harassment or abusive behavior`
    },
    {
      title: '6. Termination',
      content: `We may terminate or suspend your account and access to the App immediately, without prior notice or liability, for any reason, including if you breach these Terms.

Upon termination:
• Your right to use the App will immediately cease
• We may delete your account and associated data
• Provisions of these Terms that by their nature should survive termination shall survive`
    },
    {
      title: '7. Disclaimer of Warranties',
      content: `The App is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that:

• The App will be uninterrupted or error-free
• The App will be compatible with your device
• Results from using the App will be accurate or reliable
• Defects will be corrected

You use the App at your own risk, especially when exercising outdoors.`
    },
    {
      title: '8. Limitation of Liability',
      content: `To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including:

• Personal injury or property damage from using the App
• Loss of profits or data
• Unauthorized access to your account
• Errors or omissions in the App's content

Our total liability shall not exceed the amount you paid us (if any) in the past 12 months.`
    },
    {
      title: '9. Changes to Terms',
      content: `We reserve the right to modify these Terms at any time. We will notify you of significant changes through:

• In-app notifications
• Email to your registered address
• Updates to the "Last Updated" date

Your continued use of the App after changes constitutes acceptance of the new Terms.`
    },
    {
      title: '10. Governing Law',
      content: `These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.

Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Belgaum, Karnataka, India.`
    },
    {
      title: '11. Contact Information',
      content: `If you have any questions about these Terms, please contact us:

Email: support@intvl-invade.com
Address: Belgaum, Karnataka, India

Last Updated: February 16, 2026`
    }
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introText}>
            Please read these Terms of Service carefully before using the INVADE application. 
            By using our service, you agree to these terms.
          </Text>
          <Text style={styles.lastUpdated}>Last Updated: February 16, 2026</Text>
        </View>

        {/* Sections */}
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        {/* Contact Button */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Questions?</Text>
          <Text style={styles.contactText}>
            If you have any questions about these Terms, please contact our support team.
          </Text>
          <Button
            title="Contact Support"
            variant="secondary"
            size="large"
            onPress={() => Linking.openURL('mailto:support@intvl-invade.com')}
            style={styles.contactButton}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
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
  scrollView: {
    flex: 1,
  },
  introSection: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.lg,
  },
  introText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 24,
  },
  lastUpdated: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionContent: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  contactSection: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  contactTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  contactText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  contactButton: {
    marginTop: Spacing.sm,
  },
});
