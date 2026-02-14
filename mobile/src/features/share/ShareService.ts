/**
 * Share Service - Handles creating and sharing run cards
 */

import { Share, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { ActivityData } from '../activity/services/activityStorage';

export interface ShareableRunData {
  id: string;
  distance: number;
  duration: number;
  zonesCaptured: number;
  coordinates: { latitude: number; longitude: number }[];
  date: string;
  userName: string;
}

export interface ShareTemplate {
  title: string;
  message: string;
  hashtags: string[];
}

// Share message templates
const SHARE_TEMPLATES: Record<string, ShareTemplate> = {
  runComplete: {
    title: 'Run Complete! 🏃',
    message: 'Just completed a {distance}km run and captured {zones} zones! 💪',
    hashtags: ['#INVTL', '#RunCaptureConquer', '#TerritoryRunning'],
  },
  zoneCapture: {
    title: 'Zone Captured! 👑',
    message: 'I just captured Zone #{zoneId}! This zone is now MINE! 🔥',
    hashtags: ['#INVTL', '#ZoneCaptured', '#TerritoryRunning'],
  },
  rankUp: {
    title: 'Ranking Up! 🏆',
    message: 'I reached #{rank} in {area}! Coming for that #1 spot! 💪',
    hashtags: ['#INVTL', '#Top10', '#RunningGoals'],
  },
  streak: {
    title: 'Streak Alive! 🔥',
    message: '{days} days running streak! Can\'t stop won\'t stop! 🔥',
    hashtags: ['#INVTL', '#Streak', '#RunningStreak'],
  },
  invite: {
    title: 'Join My Squad! 👥',
    message: 'I\'m capturing territory in INVTL. Join my squad with code {code} and let\'s dominate together! 🏃‍♂️👑',
    hashtags: ['#INVTL', '#JoinMySquad', '#RunningTogether'],
  },
};

/**
 * Format share message from template
 */
export function formatShareMessage(
  templateKey: keyof typeof SHARE_TEMPLATES,
  variables: Record<string, string | number>
): string {
  const template = SHARE_TEMPLATES[templateKey];
  let message = template.message;
  
  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    message = message.replace(`{${key}}`, String(value));
  });
  
  // Add hashtags
  const hashtags = template.hashtags.join(' ');
  return `${message}\n\n${hashtags}\n\nDownload INVTL: https://invtl.app/download`;
}

/**
 * Share run completion
 */
export async function shareRun(runData: ShareableRunData): Promise<void> {
  const distanceKm = (runData.distance / 1000).toFixed(2);
  const message = formatShareMessage('runComplete', {
    distance: distanceKm,
    zones: runData.zonesCaptured,
  });
  
  try {
    await Share.share({
      message,
      title: 'My INVTL Run',
    }, {
      dialogTitle: 'Share Your Run',
      tintColor: '#00D1FF',
    });
  } catch (error) {
    console.error('Error sharing run:', error);
  }
}

/**
 * Share zone capture
 */
export async function shareZoneCapture(zoneId: string, zoneName?: string): Promise<void> {
  const message = formatShareMessage('zoneCapture', {
    zoneId,
    zoneName: zoneName || zoneId,
  });
  
  try {
    await Share.share({
      message,
      title: 'Zone Captured!',
    });
  } catch (error) {
    console.error('Error sharing zone capture:', error);
  }
}

/**
 * Share rank achievement
 */
export async function shareRank(rank: number, area: string): Promise<void> {
  const message = formatShareMessage('rankUp', {
    rank,
    area,
  });
  
  try {
    await Share.share({
      message,
      title: 'Ranking Up!',
    });
  } catch (error) {
    console.error('Error sharing rank:', error);
  }
}

/**
 * Share streak
 */
export async function shareStreak(days: number): Promise<void> {
  const message = formatShareMessage('streak', { days });
  
  try {
    await Share.share({
      message,
      title: `${days} Day Streak!`,
    });
  } catch (error) {
    console.error('Error sharing streak:', error);
  }
}

/**
 * Share invite code
 */
export async function shareInviteCode(code: string, userName: string): Promise<void> {
  const message = formatShareMessage('invite', { code });
  
  try {
    await Share.share({
      message,
      title: `${userName} invited you to INVTL`,
    });
  } catch (error) {
    console.error('Error sharing invite:', error);
  }
}

/**
 * Generate share image (placeholder for image generation)
 * In production, this would use libraries like react-native-view-shot
 */
export async function generateShareImage(
  runData: ShareableRunData
): Promise<string | null> {
  // This is a placeholder - in production, you'd:
  // 1. Render a view with the run data
  // 2. Use react-native-view-shot to capture it
  // 3. Save to cache directory
  // 4. Return the file URI
  
  console.log('Generating share image for run:', runData.id);
  return null;
}

/**
 * Check if sharing is available
 */
export function isSharingAvailable(): boolean {
  return true; // Share API is always available on iOS/Android
}
