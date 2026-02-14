/**
 * INVTL Spacing System
 * Consistent spacing scale for the entire app
 */

export const Spacing = {
  // Base unit: 4px
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
  '8xl': 96,
  '9xl': 128,
};

// Common layout constants
export const Layout = {
  // Screen padding
  screenPadding: 16,
  screenPaddingLarge: 24,
  
  // Component spacing
  cardPadding: 16,
  cardBorderRadius: 16,
  cardGap: 12,
  
  // Button sizes
  buttonHeight: 56,
  buttonBorderRadius: 28,
  buttonPadding: 24,
  
  // Input sizes
  inputHeight: 48,
  inputBorderRadius: 12,
  
  // Avatar sizes
  avatarSmall: 32,
  avatarMedium: 44,
  avatarLarge: 64,
  avatarXLarge: 80,
  
  // Icon sizes
  iconSmall: 16,
  iconMedium: 24,
  iconLarge: 32,
  iconXLarge: 48,
  
  // Map related
  mapZoneCardHeight: 120,
  mapBottomSheetHeight: 200,
};

// Shadow styles for elevation
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  xlarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
};
