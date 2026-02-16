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

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect the following types of information:

Personal Information:
• Name and username
• Email address
• Phone number (optional)
• Date of birth (optional)
• Profile photo (optional)

Location Information:
• Precise GPS location during runs
• City and country information
• Route data and zone captures

Usage Information:
• Run statistics (distance, time, pace)
• Zone captures and achievements
• App usage patterns
• Device information (type, OS version)

Technical Information:
• IP address
• Push notification tokens
• App crash logs
• Performance data`
    },
    {
      title: '2. How We Use Your Information',
      content: `We use your information to:

• Provide and improve the App's core features
• Track your fitness activities and progress
• Enable social features (friends, leaderboards)
• Send notifications about your activities
• Personalize your experience
• Analyze usage patterns to improve the App
• Prevent fraud and abuse
• Comply with legal obligations

We do NOT:
• Sell your personal information to third parties
• Use your location data for advertising
• Share your exact location with other users without permission`
    },
    {
      title: '3. Location Data',
      content: `Location data is essential for INVADE to function. We collect:

Precise Location:
• GPS coordinates during active runs
• Route tracking for activity history
• Zone boundary detection

Location Storage:
• Your location history is stored securely
• Historical routes are visible only to you
• You can delete your location history anytime

Location Sharing:
• Your exact location is NEVER shared with other users
• Only zone captures and general statistics are shared
• Friends see your activity, not your real-time location

You can disable location services in your device settings, but this will prevent you from using core App features.`
    },
    {
      title: '4. Data Sharing and Disclosure',
      content: `We may share your information in the following circumstances:

With Your Consent:
• When you choose to share activities with friends
• When you participate in public leaderboards
• When you share achievements on social media

Service Providers:
• Cloud hosting providers (AWS, Google Cloud)
• Analytics services (Firebase Analytics)
• Push notification services (Firebase Cloud Messaging)

Legal Requirements:
• When required by law or legal process
• To protect our rights, privacy, safety, or property
• To prevent fraud or abuse

Business Transfers:
• In connection with a merger, acquisition, or sale of assets
• You will be notified of any such change`
    },
    {
      title: '5. Data Security',
      content: `We implement appropriate security measures to protect your data:

Technical Measures:
• Encryption of data in transit (TLS/SSL)
• Encryption of sensitive data at rest
• Secure authentication mechanisms
• Regular security audits

Organizational Measures:
• Limited access to personal data
• Employee training on data protection
• Incident response procedures

However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.`
    },
    {
      title: '6. Your Rights and Choices',
      content: `You have the following rights regarding your data:

Access and Portability:
• View your personal information
• Download a copy of your data
• Request data in a portable format

Correction:
• Update your profile information
• Correct inaccurate data

Deletion:
• Delete your account and associated data
• Remove specific activities or runs
• Clear your location history

Opt-Out:
• Disable push notifications
• Opt-out of marketing communications
• Control location sharing settings

To exercise these rights, contact us at privacy@intvl-invade.com`
    },
    {
      title: '7. Data Retention',
      content: `We retain your data for the following periods:

Active Accounts:
• Personal information: Until account deletion
• Location/activity data: Until account deletion
• Messages and social data: Until account deletion

Deleted Accounts:
• We initiate deletion within 30 days of request
• Some data may be retained for legal compliance
• Anonymized data may be kept for analytics

Inactive Accounts:
• Accounts inactive for 2 years may be flagged for deletion
• You will be notified before any deletion

You can request immediate deletion of your account and data at any time.`
    },
    {
      title: '8. Children Privacy',
      content: `INVADE is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.

If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at privacy@intvl-invade.com. We will promptly delete such information from our servers.`
    },
    {
      title: '9. International Data Transfers',
      content: `Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws.

We ensure appropriate safeguards are in place:
• Data processing agreements with service providers
• Standard contractual clauses for international transfers
• Adequate protection measures in recipient countries

By using the App, you consent to the transfer of your information to countries outside your jurisdiction.`
    },
    {
      title: '10. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. We will notify you of any changes by:

• Posting the new Privacy Policy in the App
• Sending an email to your registered address
• Displaying a prominent notice in the App

Changes are effective immediately upon posting. Your continued use of the App after changes constitutes acceptance of the updated policy.`
    },
    {
      title: '11. Contact Us',
      content: `If you have any questions about this Privacy Policy or our data practices, please contact us:

Email: privacy@intvl-invade.com
Address: Belgaum, Karnataka, India

Data Protection Officer:
Email: dpo@intvl-invade.com

We will respond to your inquiry within 30 days.

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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
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
            Your privacy is important to us. This Privacy Policy explains how we collect, 
            use, and protect your personal information when you use INVADE.
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
          <Text style={styles.contactTitle}>Privacy Concerns?</Text>
          <Text style={styles.contactText}>
            If you have questions about your privacy or data rights, our team is here to help.
          </Text>
          <Button
            title="Contact Privacy Team"
            variant="secondary"
            size="large"
            onPress={() => Linking.openURL('mailto:privacy@intvl-invade.com')}
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
