/**
 * Premium Animations - Hooks and Utilities
 * Expo Go Compatible - Uses React Native's Animated API
 */

import { 
  Animated, 
  Easing as RNEasing 
} from 'react-native';
import { useEffect, useCallback } from 'react';

export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

export const SPRING_CONFIG = {
  gentle: {
    friction: 6,
    tension: 40,
  },
  bounce: {
    friction: 3,
    tension: 40,
  },
  wobbly: {
    friction: 2,
    tension: 40,
  },
};

/**
 * Hook for number counter animation
 */
export function useCounterAnimation(
  endValue: number,
  duration: number = 1500,
  delay: number = 0
) {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animatedValue, {
        toValue: endValue,
        duration,
        easing: RNEasing.out(RNEasing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [endValue]);

  return animatedValue;
}

/**
 * Hook for trophy spin animation
 */
export function useTrophySpin(active: boolean, animatedValue: Animated.Value) {
  useEffect(() => {
    if (active) {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 360,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 375,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 345,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ),
        Animated.spring(animatedValue, {
          toValue: 360,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [active, animatedValue]);
}

/**
 * Hook for shimmer animation
 */
export function useShimmerAnimation(active: boolean, translateX: Animated.Value) {
  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.timing(translateX, {
          toValue: 100,
          duration: 1500,
          easing: RNEasing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [active, translateX]);
}

/**
 * Hook for progress bar animation
 */
export function useProgressAnimation(
  progress: number,
  animatedValue: Animated.Value,
  duration: number = 1000,
  delay: number = 0
) {
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animatedValue, {
        toValue: progress,
        duration,
        easing: RNEasing.out(RNEasing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [progress, animatedValue, duration, delay]);
}

export default Animated;
