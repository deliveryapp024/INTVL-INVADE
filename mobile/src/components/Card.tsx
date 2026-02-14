import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/Colors';
import { Spacing, Layout, Shadows } from '../theme/Spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[] | undefined | (ViewStyle | undefined)[];
  onPress?: () => void;
  elevation?: 'none' | 'small' | 'medium' | 'large';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export function Card({
  children,
  style,
  onPress,
  elevation = 'medium',
  padding = 'medium',
}: CardProps) {
  const Container = onPress ? TouchableOpacity : View;
  
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none': return styles.paddingNone;
      case 'small': return styles.paddingSmall;
      case 'medium': return styles.paddingMedium;
      case 'large': return styles.paddingLarge;
      default: return styles.paddingMedium;
    }
  };
  
  const cardStyles = [
    styles.base,
    styles[elevation],
    getPaddingStyle(),
    style,
  ];

  return (
    <Container style={cardStyles} onPress={onPress} activeOpacity={0.9}>
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.cardBorderRadius,
  },
  
  // Elevation styles
  none: {},
  small: Shadows.small,
  medium: Shadows.medium,
  large: Shadows.large,
  
  // Padding styles
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: Spacing.sm,
  },
  paddingMedium: {
    padding: Layout.cardPadding,
  },
  paddingLarge: {
    padding: Spacing.xl,
  },
});
