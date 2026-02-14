/**
 * Confetti - Celebration animation effect
 * Uses React Native's built-in Animated API
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../theme/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = [
  Colors.primary,
  Colors.secondary,
  Colors.success,
  Colors.territory.mine,
  Colors.territory.contested,
];

interface ConfettiPieceProps {
  delay: number;
  duration: number;
  x: number;
  color: string;
  size: number;
}

function ConfettiPiece({ delay, duration, x, color, size }: ConfettiPieceProps) {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(x)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fall = Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT + 100,
      duration,
      useNativeDriver: true,
      delay,
    });

    const drift = Animated.timing(translateX, {
      toValue: x + (Math.random() - 0.5) * 200,
      duration,
      useNativeDriver: true,
      delay,
    });

    const spin = Animated.timing(rotate, {
      toValue: Math.random() * 720 - 360,
      duration,
      useNativeDriver: true,
      delay,
    });

    const fade = Animated.timing(opacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
      delay: delay + duration - 500,
    });

    Animated.parallel([fall, drift, spin, fade]).start();
  }, []);

  const spinInterpolate = rotate.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          width: size,
          height: size,
          backgroundColor: color,
          transform: [
            { translateY },
            { translateX },
            { rotate: spinInterpolate },
          ],
          opacity,
        },
      ]}
    />
  );
}

interface ConfettiProps {
  active: boolean;
  count?: number;
  duration?: number;
  onComplete?: () => void;
}

export function Confetti({
  active,
  count = 50,
  duration = 3000,
  onComplete,
}: ConfettiProps) {
  if (!active) return null;

  const pieces = Array.from({ length: count }).map((_, i) => ({
    id: i,
    delay: Math.random() * 1000,
    duration: duration + Math.random() * 1000,
    x: Math.random() * SCREEN_WIDTH,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: Math.random() * 10 + 8,
  }));

  // Call onComplete after animation
  useEffect(() => {
    if (active && onComplete) {
      const timer = setTimeout(onComplete, duration + 1000);
      return () => clearTimeout(timer);
    }
  }, [active, duration, onComplete]);

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} {...piece} />
      ))}
    </View>
  );
}

// Simple pulse animation for celebrations
interface PulseProps {
  active: boolean;
  children: React.ReactNode;
}

export function Pulse({ active, children }: PulseProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [active]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      {children}
    </Animated.View>
  );
}

// Bounce animation for entrances
interface BounceInProps {
  children: React.ReactNode;
  delay?: number;
}

export function BounceIn({ children, delay = 0 }: BounceInProps) {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        delay,
        friction: 6,
        tension: 40,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        delay,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
      }}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 1000,
  },
  piece: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
});
