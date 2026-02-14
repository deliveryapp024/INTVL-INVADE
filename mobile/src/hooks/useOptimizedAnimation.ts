/**
 * Optimized Animation Hooks
 * Performance-focused animations using native driver
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { Animated, Easing, Platform } from 'react-native';

/**
 * Hook for fade animation
 */
export function useFadeAnimation(
  duration: number = 300,
  delay: number = 0
) {
  const opacity = useRef(new Animated.Value(0)).current;

  const fadeIn = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [opacity, duration, delay]);

  const fadeOut = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [opacity, duration]);

  return { opacity, fadeIn, fadeOut };
}

/**
 * Hook for slide animation
 */
export function useSlideAnimation(
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance: number = 50,
  duration: number = 300
) {
  const translate = useRef(new Animated.Value(distance)).current;

  const offsets = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };

  const slideIn = useCallback(() => {
    Animated.timing(translate, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [translate, duration]);

  const slideOut = useCallback(() => {
    Animated.timing(translate, {
      toValue: distance,
      duration,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [translate, distance, duration]);

  const transform = direction === 'up' || direction === 'down'
    ? [{ translateY: translate }]
    : [{ translateX: translate }];

  return { transform, slideIn, slideOut };
}

/**
 * Hook for scale animation
 */
export function useScaleAnimation(
  from: number = 0.8,
  to: number = 1,
  duration: number = 300
) {
  const scale = useRef(new Animated.Value(from)).current;

  const scaleIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: to,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scale, to]);

  const scaleOut = useCallback(() => {
    Animated.timing(scale, {
      toValue: from,
      duration,
      useNativeDriver: true,
    }).start();
  }, [scale, from, duration]);

  return { scale, scaleIn, scaleOut };
}

/**
 * Hook for pulse animation
 */
export function usePulseAnimation(
  minScale: number = 1,
  maxScale: number = 1.1,
  duration: number = 1000
) {
  const scale = useRef(new Animated.Value(minScale)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: maxScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: minScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animationRef.current.start();

    return () => {
      animationRef.current?.stop();
    };
  }, [scale, minScale, maxScale, duration]);

  return { scale };
}

/**
 * Hook for staggered children animation
 */
export function useStaggerAnimation(
  itemCount: number,
  staggerDelay: number = 100,
  duration: number = 300
) {
  const animations = useRef(
    Array(itemCount).fill(0).map(() => new Animated.Value(0))
  ).current;

  const animateIn = useCallback(() => {
    Animated.stagger(
      staggerDelay,
      animations.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      )
    ).start();
  }, [animations, staggerDelay, duration]);

  const getStyle = useCallback((index: number) => ({
    opacity: animations[index],
    transform: [{
      translateY: animations[index].interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
      }),
    }],
  }), [animations]);

  return { animateIn, getStyle };
}

/**
 * Hook for countdown animation
 */
export function useCountdownAnimation(count: number) {
  const [displayNumber, setDisplayNumber] = useState(count);
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animateNumber = useCallback((number: number) => {
    setDisplayNumber(number);
    
    // Reset values
    scale.setValue(1.5);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity]);

  const animateOut = useCallback((callback?: () => void) => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(callback);
  }, [scale, opacity]);

  return {
    displayNumber,
    scale,
    opacity,
    animateNumber,
    animateOut,
  };
}

/**
 * Hook for scroll animation (parallax, etc.)
 */
export function useScrollAnimation() {
  const scrollY = useRef(new Animated.Value(0)).current;

  const onScroll = useCallback(
    Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: true }
    ),
    [scrollY]
  );

  const interpolate = useCallback((
    inputRange: number[],
    outputRange: number[] | string[]
  ) => {
    return scrollY.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  }, [scrollY]);

  return { scrollY, onScroll, interpolate };
}

/**
 * Hook for optimized list item animation
 */
export function useListItemAnimation(index: number) {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 50; // Stagger by 50ms per item

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, translateY, opacity]);

  return {
    transform: [{ translateY }],
    opacity,
  };
}

/**
 * Hook for reduced motion preference
 */
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    // This is a simplified check - on real device use AccessibilityInfo
    const checkReducedMotion = () => {
      // Platform-specific check would go here
      setReducedMotion(false);
    };

    checkReducedMotion();
  }, []);

  return reducedMotion;
}

/**
 * Get animation duration based on reduced motion preference
 */
export function useAnimationDuration(baseDuration: number) {
  const reducedMotion = useReducedMotion();
  return reducedMotion ? 0 : baseDuration;
}
