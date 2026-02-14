/**
 * INVTL Brand Color System
 * Performance-Minimalist with Cyber-Sport accents
 */

export const Colors = {
  // Base neutrals
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  
  // Text colors
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Primary brand colors - Cyber Sport
  primary: '#00D1FF',
  primaryDark: '#00A8CC',
  primaryLight: '#4DE1FF',
  
  // Secondary - Indian Saffron appeal
  secondary: '#FF9500',
  secondaryDark: '#E68600',
  secondaryLight: '#FFB84D',
  
  // Semantic colors
  success: '#00C853',
  successLight: '#E6F9F0',
  warning: '#FFAB00',
  warningLight: '#FFF8E6',
  error: '#FF3B30',
  errorLight: '#FFEBEA',
  
  // Territory/Game colors
  territory: {
    mine: '#00D1FF',
    mineTransparent: 'rgba(0, 209, 255, 0.35)',
    opponent: '#FF3B30',
    opponentTransparent: 'rgba(255, 59, 48, 0.30)',
    neutral: '#8E8E93',
    neutralTransparent: 'rgba(142, 142, 147, 0.20)',
    contested: '#FF9500',
    contestedTransparent: 'rgba(255, 149, 0, 0.35)',
    capturing: '#00C853',
  },
  
  // Map colors
  map: {
    route: '#00D1FF',
    routeCompleted: '#00C853',
    startPoint: '#00C853',
    endPoint: '#FF3B30',
    zoneBorder: '#FFFFFF',
  },
  
  // UI accents
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',
  overlay: 'rgba(0, 0, 0, 0.5)',
  scrim: 'rgba(0, 0, 0, 0.7)',
  
  // Gradients (for buttons, cards)
  gradient: {
    primary: ['#00D1FF', '#00A8CC'] as const,
    victory: ['#00C853', '#00D1FF'] as const,
    heat: ['#FF3B30', '#FF9500', '#FFD60A'] as const,
  },
};

export const DarkColors = {
  background: '#0A0A0F',
  surface: '#1A1A2E',
  surfaceElevated: '#252542',
  
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textMuted: '#6B6B80',
  textInverse: '#1A1A2E',
  
  primary: '#00D1FF',
  primaryDark: '#00A8CC',
  primaryLight: '#4DE1FF',
  
  secondary: '#FF9500',
  secondaryDark: '#E68600',
  secondaryLight: '#FFB84D',
  
  success: '#00C853',
  successLight: 'rgba(0, 200, 83, 0.15)',
  warning: '#FFAB00',
  warningLight: 'rgba(255, 171, 0, 0.15)',
  error: '#FF453A',
  errorLight: 'rgba(255, 69, 58, 0.15)',
  
  territory: {
    mine: '#00D1FF',
    mineTransparent: 'rgba(0, 209, 255, 0.40)',
    opponent: '#FF453A',
    opponentTransparent: 'rgba(255, 69, 58, 0.35)',
    neutral: '#8E8E93',
    neutralTransparent: 'rgba(142, 142, 147, 0.25)',
    contested: '#FF9500',
    contestedTransparent: 'rgba(255, 149, 0, 0.40)',
    capturing: '#00C853',
  },
  
  map: {
    route: '#00D1FF',
    routeCompleted: '#00C853',
    startPoint: '#00C853',
    endPoint: '#FF453A',
    zoneBorder: '#FFFFFF',
  },
  
  border: '#2A2A40',
  borderLight: '#353550',
  divider: '#2A2A40',
  overlay: 'rgba(0, 0, 0, 0.7)',
  scrim: 'rgba(0, 0, 0, 0.85)',
  
  gradient: {
    primary: ['#00D1FF', '#00A8CC'] as const,
    victory: ['#00C853', '#00D1FF'] as const,
    heat: ['#FF453A', '#FF9500', '#FFD60A'] as const,
  },
};

export type ColorsType = typeof Colors;
