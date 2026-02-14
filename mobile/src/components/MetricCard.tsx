import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing } from '../theme/Spacing';

interface MetricCardProps {
  value: string;
  label: string;
  subValue?: string;
  variant?: 'large' | 'medium' | 'small';
  align?: 'center' | 'left';
  style?: ViewStyle;
  highlighted?: boolean;
}

export function MetricCard({
  value,
  label,
  subValue,
  variant = 'large',
  align = 'center',
  style,
  highlighted = false,
}: MetricCardProps) {
  return (
    <View style={[styles.container, styles[align], style]}>
      <Text style={[
        styles.value,
        styles[`${variant}Value`],
        highlighted && styles.highlightedValue,
      ]}>
        {value}
      </Text>
      <Text style={[styles.label, styles[`${variant}Label`]]}>
        {label}
      </Text>
      {subValue && (
        <Text style={styles.subValue}>{subValue}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  center: {
    alignItems: 'center',
  },
  left: {
    alignItems: 'flex-start',
  },
  
  value: {
    color: Colors.text,
    fontWeight: '800',
  },
  largeValue: {
    fontSize: Typography.metricDisplay.fontSize,
    lineHeight: Typography.metricDisplay.lineHeight,
    letterSpacing: Typography.metricDisplay.letterSpacing,
  },
  mediumValue: {
    fontSize: Typography.metricDisplaySmall.fontSize,
    lineHeight: Typography.metricDisplaySmall.lineHeight,
    letterSpacing: Typography.metricDisplaySmall.letterSpacing,
  },
  smallValue: {
    fontSize: Typography.h1.fontSize,
    lineHeight: Typography.h1.lineHeight,
    fontWeight: '700',
  },
  highlightedValue: {
    color: Colors.primary,
  },
  
  label: {
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing.xs,
  },
  largeLabel: {
    fontSize: Typography.label.fontSize,
    fontWeight: '600',
  },
  mediumLabel: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
  },
  smallLabel: {
    fontSize: Typography.captionSmall.fontSize,
    fontWeight: '500',
  },
  
  subValue: {
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
