/**
 * ProgressBar - Animated progress bar
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing } from '../theme/Spacing';

interface ProgressBarProps {
  progress: number; // 0 to 1
  total?: number;
  current?: number;
  showLabel?: boolean;
  color?: string;
  height?: number;
  animated?: boolean;
  duration?: number;
}

export function ProgressBar({
  progress,
  total,
  current,
  showLabel = true,
  color = Colors.primary,
  height = 8,
  animated = true,
  duration = 1000,
}: ProgressBarProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const widthAnim = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  useEffect(() => {
    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: clampedProgress,
        duration,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(clampedProgress);
    }
  }, [progress, animated, duration]);

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              backgroundColor: color,
              width: widthAnim,
            },
          ]}
        />
      </View>
      {showLabel && (
        <View style={styles.labelContainer}>
          {current !== undefined && total !== undefined ? (
            <Text style={styles.label}>
              {current} / {total}
            </Text>
          ) : (
            <Text style={styles.label}>{Math.round(progress * 100)}%</Text>
          )}
        </View>
      )}
    </View>
  );
}

// Circular progress for run timer
interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0 to 1
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
}

export function CircularProgress({
  size = 200,
  strokeWidth = 12,
  progress,
  color = Colors.primary,
  bgColor = Colors.border,
  children,
}: CircularProgressProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: Math.min(Math.max(progress, 0), 1),
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <View style={styles.circularContent}>{children}</View>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ rotate: '-90deg' }],
          },
        ]}
      >
        <Animated.View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: bgColor,
            borderStyle: 'solid',
            borderRightColor: color,
            borderTopColor: color,
            borderBottomColor: progress > 0.5 ? color : bgColor,
            borderLeftColor: progress > 0.75 ? color : bgColor,
            opacity: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
  labelContainer: {
    marginTop: Spacing.xs,
  },
  label: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
