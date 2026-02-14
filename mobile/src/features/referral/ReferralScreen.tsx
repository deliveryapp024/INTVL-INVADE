import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Clipboard,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../theme/Colors';
import { Typography } from '../../theme/Typography';
import { Spacing, Layout } from '../../theme/Spacing';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ZoneBadge } from '../../components/ZoneBadge';
import { Icon } from '../../components/Icon';
import { 
  getReferralData, 
  getReferralLink, 
  ReferralData,
  simulateFriendJoin,
} from './ReferralService';

export default function ReferralScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getReferralData();
    setReferralData(data);
  };

  const copyCode = useCallback(() => {
    if (referralData?.myCode) {
      Clipboard.setString(referralData.myCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [referralData]);

  const shareCode = useCallback(async () => {
    if (!referralData?.myCode) return;

    const link = getReferralLink(referralData.myCode);
    const message = `Join me on INVTL!\n\nI'm capturing territory and competing for zones in our area.\n\nUse my invite code: ${referralData.myCode}\n\nDownload: ${link}\n\nLet's run together!`;

    try {
      await Share.share({
        message,
        title: 'Join My INVTL Squad',
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share invite');
    }
  }, [referralData]);

  // For demo: simulate a friend joining
  const handleDemoFriendJoin = async () => {
    await simulateFriendJoin('Demo Friend');
    loadData();
    Alert.alert('Demo', 'Simulated a friend joining with your code!');
  };

  if (!referralData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Friends</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Icon name="gift" size={64} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Invite Friends, Get Rewards</Text>
          <Text style={styles.heroSubtitle}>
            Share your code and earn +5 zones for each friend who joins and completes their first run!
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard} elevation="medium">
            <Text style={styles.statValue}>{referralData.totalReferrals}</Text>
            <Text style={styles.statLabel}>Friends Invited</Text>
          </Card>
          <Card style={styles.statCard} elevation="medium">
            <Text style={styles.statValue}>{referralData.rewardsEarned}</Text>
            <Text style={styles.statLabel}>Zones Earned</Text>
          </Card>
          <Card style={styles.statCard} elevation="medium">
            <Text style={styles.statValue}>{referralData.pendingReferrals}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>
        </View>

        {/* Referral Code Card */}
        <Card style={styles.codeCard} elevation="large">
          <Text style={styles.codeLabel}>Your Invite Code</Text>
          
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{referralData.myCode}</Text>
          </View>

          <View style={styles.codeActions}>
            <TouchableOpacity 
              style={[styles.codeAction, copied && styles.codeActionCopied]}
              onPress={copyCode}
            >
              <View style={styles.codeActionContent}>
                <Icon name={copied ? "checkmark" : "copy"} size={18} color={copied ? Colors.success : Colors.text} />
                <Text style={[styles.codeActionText, copied && { marginLeft: 6 }]}>
                  {copied ? 'Copied' : 'Copy'}
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.codeAction, styles.codeActionShare]}
              onPress={shareCode}
            >
              <View style={styles.codeActionContent}>
                <Icon name="share" size={18} color={Colors.textInverse} />
                <Text style={[styles.codeActionText, styles.codeActionShareText, { marginLeft: 6 }]}>
                  Share
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Card>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Share Your Code</Text>
                <Text style={styles.stepDescription}>
                  Send your unique code to friends via WhatsApp, Instagram, or anywhere
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>They Download & Run</Text>
                <Text style={styles.stepDescription}>
                  Friend installs INVTL using your code and completes their first run
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>You Both Win!</Text>
                <Text style={styles.stepDescription}>
                  You get +5 zones, they get +5 zones. Everyone captures more territory!
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Friends List */}
        {referralData.referredUsers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Friends</Text>
            
            <View style={styles.friendsList}>
              {referralData.referredUsers.map((user, index) => (
                <Card key={index} style={styles.friendCard} elevation="small">
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendAvatarText}>
                      {user.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{user.name}</Text>
                    <View style={styles.friendStatusRow}>
                      <Icon 
                        name={user.status === 'completed' ? "checkmark" : "time"} 
                        size={14} 
                        color={user.status === 'completed' ? Colors.success : Colors.textMuted}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.friendStatus}>
                        {user.status === 'completed' 
                          ? `Joined ${user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : ''}`
                          : 'Pending first run'
                        }
                      </Text>
                    </View>
                  </View>
                  {user.rewardEarned ? (
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardBadgeText}>+5</Text>
                    </View>
                  ) : (
                    <ZoneBadge status="neutral" label="Waiting" size="small" />
                  )}
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Demo Button (Remove in production) */}
        <TouchableOpacity 
          style={styles.demoButton}
          onPress={handleDemoFriendJoin}
        >
          <Text style={styles.demoButtonText}>
            Demo: Simulate Friend Joining
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Header
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.text,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  placeholder: {
    width: 44,
  },
  
  // Hero
  hero: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  heroIcon: {
    marginBottom: Spacing.md,
  },
  heroTitle: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  
  // Stats
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  
  // Code Card
  codeCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  codeLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeContainer: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginVertical: Spacing.lg,
  },
  codeText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 2,
  },
  codeActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  codeAction: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 25,
    backgroundColor: Colors.borderLight,
    minWidth: 100,
    alignItems: 'center',
  },
  codeActionCopied: {
    backgroundColor: Colors.successLight,
  },
  codeActionShare: {
    backgroundColor: Colors.primary,
  },
  codeActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeActionText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  codeActionShareText: {
    color: Colors.textInverse,
  },
  
  // Section
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  
  // Steps
  steps: {
    gap: Spacing.lg,
  },
  step: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  stepDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  
  // Friends List
  friendsList: {
    gap: Spacing.sm,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  friendAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  friendStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  friendStatus: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  rewardBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardBadgeText: {
    color: Colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  
  // Demo
  demoButton: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.borderLight,
    borderRadius: 12,
    alignItems: 'center',
  },
  demoButtonText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
