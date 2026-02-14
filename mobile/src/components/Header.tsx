import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing } from '../theme/Spacing';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftAction?: {
    icon: React.ReactNode;
    onPress: () => void;
  };
  rightActions?: Array<{
    icon: React.ReactNode;
    onPress: () => void;
    badge?: number;
  }>;
  style?: ViewStyle;
  transparent?: boolean;
}

export function Header({
  title,
  subtitle,
  leftAction,
  rightActions,
  style,
  transparent = false,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.container,
      { paddingTop: insets.top },
      !transparent && styles.containerOpaque,
      style,
    ]}>
      <View style={styles.content}>
        {/* Left side */}
        <View style={styles.side}>
          {leftAction && (
            <TouchableOpacity onPress={leftAction.onPress} style={styles.actionButton}>
              {leftAction.icon}
            </TouchableOpacity>
          )}
        </View>
        
        {/* Center - Title */}
        <View style={styles.center}>
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
        
        {/* Right side */}
        <View style={[styles.side, styles.rightSide]}>
          {rightActions?.map((action, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={action.onPress} 
              style={styles.actionButton}
            >
              {action.icon}
              {action.badge !== undefined && action.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {action.badge > 9 ? '9+' : action.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  containerOpaque: {
    backgroundColor: Colors.background,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: Spacing.lg,
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
  },
  rightSide: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...Typography.h4,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  badgeText: {
    color: Colors.textInverse,
    fontSize: 9,
    fontWeight: '700',
  },
});
