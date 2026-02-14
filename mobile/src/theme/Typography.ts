/**
 * INVTL Typography System
 * Bold, data-first, performance-oriented
 */

export const Typography = {
  // Metric displays - Large numbers for pace, distance, time
  metricDisplay: {
    fontSize: 72,
    fontWeight: '800' as const,
    letterSpacing: -2,
    lineHeight: 72,
  },
  metricDisplaySmall: {
    fontSize: 48,
    fontWeight: '700' as const,
    letterSpacing: -1,
    lineHeight: 48,
  },
  
  // Headers
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 26,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
    lineHeight: 24,
  },
  
  // Body text
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 20,
  },
  
  // Labels and captions
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    lineHeight: 18,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 16,
  },
  captionSmall: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    lineHeight: 14,
  },
  
  // Special
  button: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  tab: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    lineHeight: 14,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
    lineHeight: 12,
  },
};

export type TypographyType = typeof Typography;

// Font family (using system fonts for performance)
export const FontFamily = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
  heavy: 'System',
};

// For metric displays, we might want monospace for numbers
export const MetricFont = {
  regular: 'System',
  // Could use a custom monospace font for better number alignment
};
