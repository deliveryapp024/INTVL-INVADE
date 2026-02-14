/**
 * Image Component
 * Uses expo-image for optimal performance
 * Features: caching, lazy loading, blur hash support
 */

import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image as ExpoImage, ImageSource } from 'expo-image';
import { ShimmerLoading } from './animations';
import { Logger } from '../utils/Logger';

interface ImageProps {
  source: ImageSource | string | number;
  style?: ViewStyle;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  contentPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  priority?: 'low' | 'normal' | 'high';
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
  transition?: number;
  placeholder?: ImageSource | string;
  blurRadius?: number;
  onLoad?: () => void;
  onError?: (error: any) => void;
  accessibilityLabel?: string;
}

export const Image = memo(({
  source,
  style,
  contentFit = 'cover',
  contentPosition = 'center',
  priority = 'normal',
  cachePolicy = 'memory-disk',
  transition = 300,
  placeholder,
  blurRadius,
  onLoad,
  onError,
  accessibilityLabel,
}: ImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((error: any) => {
    setIsLoading(false);
    setHasError(true);
    Logger.error('Image load failed:', error);
    onError?.(error);
  }, [onError]);

  // Normalize source
  const normalizedSource = typeof source === 'string' 
    ? { uri: source } 
    : source;

  if (hasError) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorText}>⚠️</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {isLoading && (
        <View style={StyleSheet.absoluteFill}>
          <ShimmerLoading
            width="100%"
            height="100%"
            borderRadius={style?.borderRadius as number || 0}
          />
        </View>
      )}
      
      <ExpoImage
        source={normalizedSource}
        style={[StyleSheet.absoluteFill, { opacity: isLoading ? 0 : 1 }]}
        contentFit={contentFit}
        contentPosition={contentPosition}
        priority={priority}
        cachePolicy={cachePolicy}
        transition={transition}
        placeholder={placeholder}
        blurRadius={blurRadius}
        onLoad={handleLoad}
        onError={handleError}
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
});

Image.displayName = 'Image';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fecaca',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 24,
  },
});

/**
 * Avatar Component
 * Optimized for profile pictures with caching
 */
interface AvatarProps {
  source: ImageSource | string | number;
  size?: number;
  borderRadius?: number;
  placeholder?: ImageSource | string;
}

export const Avatar = memo(({
  source,
  size = 48,
  borderRadius,
  placeholder,
}: AvatarProps) => (
  <Image
    source={source}
    style={{
      width: size,
      height: size,
      borderRadius: borderRadius ?? size / 2,
    }}
    contentFit="cover"
    priority="high"
    cachePolicy="memory-disk"
    transition={200}
    placeholder={placeholder}
  />
));

Avatar.displayName = 'Avatar';

/**
 * BackgroundImage Component
 * For hero sections and backgrounds
 */
interface BackgroundImageProps {
  source: ImageSource | string | number;
  children: React.ReactNode;
  style?: ViewStyle;
  blurRadius?: number;
}

export const BackgroundImage = memo(({
  source,
  children,
  style,
  blurRadius,
}: BackgroundImageProps) => (
  <View style={[styles.backgroundContainer, style]}>
    <ExpoImage
      source={typeof source === 'string' ? { uri: source } : source}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      priority="high"
      cachePolicy="memory-disk"
      blurRadius={blurRadius}
    />
    {children}
  </View>
));

BackgroundImage.displayName = 'BackgroundImage';

const backgroundStyles = StyleSheet.create({
  backgroundContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
});

export default Image;
