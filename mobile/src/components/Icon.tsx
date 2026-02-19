/**
 * Icon Component - Vector Icons for INVTL
 * Replaces all emojis with professional icons
 */

import React from 'react';
import { Ionicons, MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import { Colors } from '../theme/Colors';

export type IconName = 
  // Navigation
  | 'arrow-back'
  | 'arrow-forward'
  | 'chevron-back'
  | 'chevron-forward'
  | 'close'
  | 'menu'
  | 'settings'
  
  // User & Profile
  | 'person'
  | 'person-circle'
  | 'people'
  | 'trophy'
  | 'medal'
  | 'star'
  
  // Actions
  | 'share'
  | 'copy'
  | 'link'
  | 'add'
  | 'add-circle'
  | 'remove'
  | 'create'
  | 'trash'
  | 'search'
  | 'filter'
  | 'refresh'
  | 'call'
  
  // Media
  | 'play'
  | 'pause'
  | 'stop'
  | 'play-circle'
  | 'pause-circle'
  
  // Status
  | 'checkmark'
  | 'checkmark-circle'
  | 'warning'
  | 'alert-circle'
  | 'information-circle'
  
  // Location
  | 'location'
  | 'navigate'
  | 'map'
  | 'compass'
  
  // Activity
  | 'flame'
  | 'flash'
  | 'flashlight'
  | 'time'
  | 'timer'
  | 'speedometer'
  
  // Social
  | 'heart'
  | 'chatbubble'
  | 'mail'
  | 'send'
  | 'gift'
  | 'flag'
  | 'crown'
  | 'shield'
  | 'shield-checkmark'
  
  // Misc
  | 'eye'
  | 'eye-off'
  | 'notifications'
  | 'notifications-off'
  | 'home'
  | 'stats-chart'
  | 'grid'
  | 'list'
  | 'more'
  | 'ellipsis-horizontal'
  | 'ellipsis-vertical'
  
  // Feedback & Controls
  | 'vibrate'
  | 'vibrate-off'
  | 'volume-high'
  | 'volume-off'
  | 'volume-mute'
  | 'flash'
  | 'sparkles'
  | 'square'
  | 'lock-closed'
  | 'moon'
  | 'sunny'
  | 'cloud'
  | 'rainy'
  | 'thunderstorm'
  | 'partly-sunny'
  | 'water'
  | 'leaf'
  | 'cloud-offline'
  | 'shield'
  
  // Custom/Running specific
  | 'run'
  | 'run-fast'
  | 'shoe-sneaker'
  | 'target'
  | 'bullseye'
  | 'lightning-bolt'
  | 'zap'
  | 'fire'
  | 'trending-up'
  | 'chart-line';

type IconFamily = 'Ionicons' | 'MaterialCommunityIcons' | 'FontAwesome6';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  family?: IconFamily;
  style?: any;
}

// Icon mapping to families
const ICON_MAPPING: Record<string, { family: IconFamily; name: string }> = {
  // Navigation
  'arrow-back': { family: 'Ionicons', name: 'arrow-back' },
  'arrow-forward': { family: 'Ionicons', name: 'arrow-forward' },
  'chevron-back': { family: 'Ionicons', name: 'chevron-back' },
  'chevron-forward': { family: 'Ionicons', name: 'chevron-forward' },
  'close': { family: 'Ionicons', name: 'close' },
  'menu': { family: 'Ionicons', name: 'menu' },
  'settings': { family: 'Ionicons', name: 'settings-outline' },
  
  // User & Profile
  'person': { family: 'Ionicons', name: 'person' },
  'person-circle': { family: 'Ionicons', name: 'person-circle' },
  'people': { family: 'Ionicons', name: 'people' },
  'trophy': { family: 'Ionicons', name: 'trophy' },
  'medal': { family: 'MaterialCommunityIcons', name: 'medal' },
  'star': { family: 'Ionicons', name: 'star' },
  
  // Actions
  'share': { family: 'Ionicons', name: 'share-outline' },
  'copy': { family: 'Ionicons', name: 'copy-outline' },
  'link': { family: 'Ionicons', name: 'link' },
  'add': { family: 'Ionicons', name: 'add' },
  'add-circle': { family: 'Ionicons', name: 'add-circle' },
  'remove': { family: 'Ionicons', name: 'remove' },
  'create': { family: 'Ionicons', name: 'create-outline' },
  'trash': { family: 'Ionicons', name: 'trash-outline' },
  'search': { family: 'Ionicons', name: 'search' },
  'filter': { family: 'Ionicons', name: 'filter' },
  'refresh': { family: 'Ionicons', name: 'refresh' },
  
  // Media
  'play': { family: 'Ionicons', name: 'play' },
  'pause': { family: 'Ionicons', name: 'pause' },
  'stop': { family: 'Ionicons', name: 'stop' },
  'play-circle': { family: 'Ionicons', name: 'play-circle' },
  'pause-circle': { family: 'Ionicons', name: 'pause-circle' },
  
  // Status
  'checkmark': { family: 'Ionicons', name: 'checkmark' },
  'checkmark-circle': { family: 'Ionicons', name: 'checkmark-circle' },
  'warning': { family: 'Ionicons', name: 'warning' },
  'alert-circle': { family: 'Ionicons', name: 'alert-circle' },
  'information-circle': { family: 'Ionicons', name: 'information-circle' },
  
  // Location
  'location': { family: 'Ionicons', name: 'location' },
  'navigate': { family: 'Ionicons', name: 'navigate' },
  'map': { family: 'Ionicons', name: 'map' },
  'compass': { family: 'Ionicons', name: 'compass' },
  
  // Activity
  'flame': { family: 'Ionicons', name: 'flame' },
  'flash': { family: 'Ionicons', name: 'flash' },
  'flashlight': { family: 'Ionicons', name: 'flashlight' },
  'time': { family: 'Ionicons', name: 'time-outline' },
  'timer': { family: 'Ionicons', name: 'timer-outline' },
  'speedometer': { family: 'Ionicons', name: 'speedometer' },
  
  // Social
  'heart': { family: 'Ionicons', name: 'heart' },
  'chatbubble': { family: 'Ionicons', name: 'chatbubble-outline' },
  'mail': { family: 'Ionicons', name: 'mail' },
  'send': { family: 'Ionicons', name: 'send' },
  'gift': { family: 'Ionicons', name: 'gift' },
  'flag': { family: 'Ionicons', name: 'flag' },
  'crown': { family: 'MaterialCommunityIcons', name: 'crown' },
  'shield': { family: 'Ionicons', name: 'shield' },
  'shield-checkmark': { family: 'Ionicons', name: 'shield-checkmark' },
  'call': { family: 'Ionicons', name: 'call' },
  
  // Misc
  'eye': { family: 'Ionicons', name: 'eye' },
  'eye-off': { family: 'Ionicons', name: 'eye-off' },
  'notifications': { family: 'Ionicons', name: 'notifications-outline' },
  'notifications-off': { family: 'Ionicons', name: 'notifications-off-outline' },
  'home': { family: 'Ionicons', name: 'home' },
  'stats-chart': { family: 'Ionicons', name: 'stats-chart' },
  'grid': { family: 'Ionicons', name: 'grid' },
  'list': { family: 'Ionicons', name: 'list' },
  'more': { family: 'Ionicons', name: 'ellipsis-horizontal' },
  'ellipsis-horizontal': { family: 'Ionicons', name: 'ellipsis-horizontal' },
  'ellipsis-vertical': { family: 'Ionicons', name: 'ellipsis-vertical' },
  
  // Feedback & Controls
  'vibrate': { family: 'MaterialCommunityIcons', name: 'vibrate' },
  'vibrate-off': { family: 'MaterialCommunityIcons', name: 'vibrate-off' },
  'volume-high': { family: 'Ionicons', name: 'volume-high' },
  'volume-off': { family: 'Ionicons', name: 'volume-off' },
  'volume-mute': { family: 'Ionicons', name: 'volume-mute' },
  'sparkles': { family: 'Ionicons', name: 'sparkles' },
  'square': { family: 'Ionicons', name: 'square' },
  'lock-closed': { family: 'Ionicons', name: 'lock-closed' },
  'moon': { family: 'Ionicons', name: 'moon' },
  'sunny': { family: 'Ionicons', name: 'sunny' },
  'cloud': { family: 'Ionicons', name: 'cloud' },
  'rainy': { family: 'Ionicons', name: 'rainy' },
  'thunderstorm': { family: 'Ionicons', name: 'thunderstorm' },
  'partly-sunny': { family: 'Ionicons', name: 'partly-sunny' },
  'water': { family: 'Ionicons', name: 'water' },
  'leaf': { family: 'Ionicons', name: 'leaf' },
  'cloud-offline': { family: 'Ionicons', name: 'cloud-offline' },
  
  // Custom/Running specific
  'run': { family: 'MaterialCommunityIcons', name: 'run' },
  'run-fast': { family: 'MaterialCommunityIcons', name: 'run-fast' },
  'shoe-sneaker': { family: 'MaterialCommunityIcons', name: 'shoe-sneaker' },
  'target': { family: 'Ionicons', name: 'locate' },
  'bullseye': { family: 'MaterialCommunityIcons', name: 'bullseye' },
  'lightning-bolt': { family: 'MaterialCommunityIcons', name: 'lightning-bolt' },
  'zap': { family: 'Ionicons', name: 'flash' },
  'fire': { family: 'MaterialCommunityIcons', name: 'fire' },
  'trending-up': { family: 'Ionicons', name: 'trending-up' },
  'chart-line': { family: 'MaterialCommunityIcons', name: 'chart-line' },
};

export function Icon({ name, size = 24, color = Colors.text, family, style }: IconProps) {
  const mapping = ICON_MAPPING[name];
  
  if (!mapping) {
    console.warn(`Icon "${name}" not found in mapping`);
    return null;
  }
  
  const iconFamily = family || mapping.family;
  const iconName = mapping.name;
  
  switch (iconFamily) {
    case 'Ionicons':
      return <Ionicons name={iconName as any} size={size} color={color} style={style} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons name={iconName as any} size={size} color={color} style={style} />;
    case 'FontAwesome6':
      return <FontAwesome6 name={iconName as any} size={size} color={color} style={style} />;
    default:
      return <Ionicons name={iconName as any} size={size} color={color} style={style} />;
  }
}

// Preset sizes for consistency
export const IconSizes = {
  small: 16,
  medium: 24,
  large: 32,
  xlarge: 48,
  giant: 64,
};

// Common icon presets
export const CommonIcons = {
  back: () => <Icon name="arrow-back" />,
  close: () => <Icon name="close" />,
  settings: () => <Icon name="settings" />,
  profile: () => <Icon name="person-circle" />,
  trophy: () => <Icon name="trophy" />,
  share: () => <Icon name="share" />,
  check: () => <Icon name="checkmark-circle" />,
  flame: () => <Icon name="flame" />,
  crown: () => <Icon name="crown" />,
  run: () => <Icon name="run-fast" />,
  location: () => <Icon name="location" />,
  play: () => <Icon name="play-circle" />,
  pause: () => <Icon name="pause-circle" />,
  add: () => <Icon name="add" />,
  search: () => <Icon name="search" />,
  notifications: () => <Icon name="notifications" />,
};
