import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { Colors } from '../../theme/Colors';
import { Typography } from '../../theme/Typography';
import { Spacing } from '../../theme/Spacing';
import { Card } from '../../components/Card';

interface ShareCardProps {
  variant: 'run' | 'zone' | 'rank' | 'streak';
  title: string;
  subtitle?: string;
  stats: Array<{ label: string; value: string }>;
  primaryColor?: string;
  emoji?: string;
  onShare: () => void;
}

const VARIANT_CONFIG = {
  run: {
    emoji: '🏃',
    color: Colors.primary,
    defaultTitle: 'Run Complete!',
  },
  zone: {
    emoji: '👑',
    color: Colors.territory.mine,
    defaultTitle: 'Zone Captured!',
  },
  rank: {
    emoji: '🏆',
    color: Colors.secondary,
    defaultTitle: 'Ranking Up!',
  },
  streak: {
    emoji: '🔥',
    color: Colors.territory.contested,
    defaultTitle: 'Streak Alive!',
  },
};

export function ShareCard({
  variant,
  title,
  subtitle,
  stats,
  primaryColor,
  emoji,
  onShare,
}: ShareCardProps) {
  const config = VARIANT_CONFIG[variant];
  const color = primaryColor || config.color;
  const icon = emoji || config.emoji;

  const handleShare = async () => {
    try {
      await onShare();
    } catch (error) {
      Alert.alert('Sharing Failed', 'Unable to share at this time. Please try again.');
    }
  };

  return (
    <Card style={styles.container} elevation="large">
      {/* Header */}
      <View style={[styles.header, { backgroundColor: color }]}>
        <Text style={styles.headerEmoji}>{icon}</Text>
        <Text style={styles.headerTitle}>{title || config.defaultTitle}</Text>
        {subtitle && (
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <Text style={[styles.statValue, { color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* INVTL Branding */}
      <View style={styles.branding}>
        <Text style={styles.brandingText}>INVT</Text>
        <View style={[styles.brandingDot, { backgroundColor: color }]} />
        <Text style={styles.brandingTagline}>Run. Capture. Conquer.</Text>
      </View>

      {/* Share Button */}
      <TouchableOpacity 
        style={[styles.shareButton, { backgroundColor: color }]} 
        onPress={handleShare}
        activeOpacity={0.8}
      >
        <Text style={styles.shareButtonText}>📤 Share</Text>
      </TouchableOpacity>

      {/* Platforms */}
      <View style={styles.platforms}>
        <Text style={styles.platformsText}>Share to Instagram, WhatsApp, or anywhere</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    marginHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderTopLeftRadius: Layout.cardBorderRadius,
    borderTopRightRadius: Layout.cardBorderRadius,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.textInverse,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: 4,
  },
  brandingText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  brandingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  brandingTagline: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  shareButton: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  shareButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
    fontSize: 16,
  },
  platforms: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  platformsText: {
    ...Typography.captionSmall,
    color: Colors.textMuted,
  },
});

import { Layout } from '../../theme/Spacing';
