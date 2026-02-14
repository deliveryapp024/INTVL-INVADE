/**
 * Animation Components - Expo Go Compatible Version
 * Uses React Native's built-in Animated API (works in Expo Go)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Animated,
  Text,
  TextStyle,
  View,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  Easing as RNEasing,
} from 'react-native';
import { Colors } from '../../theme/Colors';
import { Icon } from '../Icon';

const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedView = Animated.createAnimatedComponent(View);

// Simple fade in wrapper component
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export function FadeIn({ children, delay = 0, duration = 400, style }: FadeInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <AnimatedView style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </AnimatedView>
  );
}

// Scale in animation
interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

export function ScaleIn({ children, delay = 0, duration = 300 }: ScaleInProps) {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <AnimatedView style={{ opacity, transform: [{ scale }] }}>
      {children}
    </AnimatedView>
  );
}

// Bounce in animation
interface BounceInProps {
  children: React.ReactNode;
  delay?: number;
}

export function BounceIn({ children, delay = 0 }: BounceInProps) {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <AnimatedView style={{ opacity, transform: [{ scale }] }}>
      {children}
    </AnimatedView>
  );
}

// Animated Counter
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  delay?: number;
  style?: TextStyle;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  onComplete?: () => void;
}

export function AnimatedCounter({
  value,
  duration = 1500,
  delay = 0,
  style,
  prefix = '',
  suffix = '',
  decimals = 0,
  onComplete,
}: AnimatedCounterProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(value);
    });

    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animatedValue, {
        toValue: value,
        duration,
        easing: RNEasing.out(RNEasing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete?.();
    });

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value]);

  return (
    <Text style={style}>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </Text>
  );
}

// Animated Progress Bar
interface AnimatedProgressBarProps {
  progress: number;
  duration?: number;
  delay?: number;
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  shimmer?: boolean;
  style?: ViewStyle;
}

export function AnimatedProgressBar({
  progress,
  duration = 1000,
  delay = 0,
  height = 8,
  backgroundColor = Colors.border,
  fillColor = Colors.primary,
  shimmer = false,
  style,
}: AnimatedProgressBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const shimmerTranslate = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(widthAnim, {
        toValue: progress,
        duration,
        easing: RNEasing.out(RNEasing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    if (shimmer) {
      Animated.loop(
        Animated.timing(shimmerTranslate, {
          toValue: 100,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [progress]);

  const widthInterpolate = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[
        {
          height,
          backgroundColor,
          borderRadius: height / 2,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <AnimatedView
        style={{
          height: '100%',
          backgroundColor: fillColor,
          borderRadius: height / 2,
          width: widthInterpolate,
        }}
      >
        {shimmer && (
          <AnimatedView
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '30%',
              backgroundColor: 'rgba(255,255,255,0.3)',
              transform: [{ translateX: shimmerTranslate }],
            }}
          />
        )}
      </AnimatedView>
    </View>
  );
}

// Spinning Trophy
interface SpinningTrophyProps {
  active: boolean;
  size?: number;
  color?: string;
}

export function SpinningTrophy({
  active,
  size = 48,
  color = Colors.warning,
}: SpinningTrophyProps) {
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (active) {
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: 360,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotation, {
              toValue: 375,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(rotation, {
              toValue: 345,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ),
        Animated.spring(rotation, {
          toValue: 360,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.3,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [active]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <AnimatedView
      style={{
        transform: [
          { rotate: rotateInterpolate },
          { scale },
        ],
      }}
    >
      <Icon name="trophy" size={size} color={color} />
    </AnimatedView>
  );
}

// Pulse Dot
interface PulseDotProps {
  color?: string;
  size?: number;
  active?: boolean;
}

export function PulseDot({
  color = Colors.success,
  size = 12,
  active = true,
}: PulseDotProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1.5,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.5,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }
  }, [active]);

  return (
    <AnimatedView
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}

// Pressable Scale
interface PressableScaleProps extends TouchableOpacityProps {
  children: React.ReactNode;
  scale?: number;
}

export function PressableScale({
  children,
  scale = 0.95,
  onPressIn,
  onPressOut,
  ...props
}: PressableScaleProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback((e: any) => {
    Animated.spring(scaleAnim, {
      toValue: scale,
      friction: 5,
      useNativeDriver: true,
    }).start();
    onPressIn?.(e);
  }, [onPressIn, scale]);

  const handlePressOut = useCallback((e: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
    onPressOut?.(e);
  }, [onPressOut]);

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      {...props}
    >
      <AnimatedView style={{ transform: [{ scale: scaleAnim }] }}>
        {children}
      </AnimatedView>
    </TouchableOpacity>
  );
}

// Shimmer Loading
interface ShimmerLoadingProps {
  width?: number | `${number}%` | string;
  height?: number;
  borderRadius?: number;
  colors?: string[];
  style?: ViewStyle;
}

export function ShimmerLoading({
  width = '100%',
  height = 20,
  borderRadius = 4,
  colors = ['#E0E0E0', '#F0F0F0', '#E0E0E0'],
  style,
}: ShimmerLoadingProps) {
  const translateX = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 100,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          backgroundColor: colors[0],
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <AnimatedView
        style={{
          width: '30%',
          height: '100%',
          backgroundColor: colors[1],
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}

// Stagger Container
interface StaggerContainerProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  baseDelay?: number;
}

export function StaggerContainer({
  children,
  staggerDelay = 100,
  baseDelay = 0,
}: StaggerContainerProps) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <FadeIn key={index} delay={baseDelay + index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </>
  );
}

// Export Animated from React Native
export { Animated };
