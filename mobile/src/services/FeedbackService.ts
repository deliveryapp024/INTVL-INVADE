/**
 * Feedback Service - Vibration & Sound Effects
 * Haptic feedback and audio for enhanced UX
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SoundService } from './SoundService';

// Enable/disable flags
let hapticsEnabled = true;
let soundsEnabled = true;

export const FeedbackService = {
  /**
   * Initialize audio session
   */
  async init(): Promise<void> {
    await SoundService.playBeep(1, 1); // Warm up audio
  },

  /**
   * Toggle haptics on/off
   */
  setHapticsEnabled(enabled: boolean): void {
    hapticsEnabled = enabled;
  },

  /**
   * Toggle sounds on/off
   */
  setSoundsEnabled(enabled: boolean): void {
    soundsEnabled = enabled;
    SoundService.setEnabled(enabled);
  },

  /**
   * Get current settings
   */
  getSettings(): { haptics: boolean; sounds: boolean } {
    return { haptics: hapticsEnabled, sounds: soundsEnabled };
  },

  // ============== HAPTIC FEEDBACK ==============

  /**
   * Light tap - subtle feedback
   * Use for: Button presses, selection changes
   */
  async lightTap(): Promise<void> {
    if (!hapticsEnabled) return;
    try {
      if (Platform.OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        await Haptics.selectionAsync();
      }
    } catch {
      // Ignore haptic errors
    }
  },

  /**
   * Medium tap - standard feedback
   * Use for: Important actions, toggles
   */
  async mediumTap(): Promise<void> {
    if (!hapticsEnabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore haptic errors
    }
  },

  /**
   * Heavy tap - strong feedback
   * Use for: Critical actions, confirmations
   */
  async heavyTap(): Promise<void> {
    if (!hapticsEnabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Ignore haptic errors
    }
  },

  /**
   * Success feedback
   * Use for: Successful completion, achievements
   */
  async success(): Promise<void> {
    if (!hapticsEnabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore haptic errors
    }
  },

  /**
   * Error feedback
   * Use for: Errors, failures, warnings
   */
  async error(): Promise<void> {
    if (!hapticsEnabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Ignore haptic errors
    }
  },

  /**
   * Warning feedback
   * Use for: Cautions, partial success
   */
  async warning(): Promise<void> {
    if (!hapticsEnabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Ignore haptic errors
    }
  },

  /**
   * Generic notification feedback
   * Use for: Dynamic notification types
   */
  async notification(type: 'success' | 'error' | 'warning'): Promise<void> {
    if (!hapticsEnabled) return;
    try {
      const notificationType = 
        type === 'success' ? Haptics.NotificationFeedbackType.Success :
        type === 'error' ? Haptics.NotificationFeedbackType.Error :
        Haptics.NotificationFeedbackType.Warning;
      await Haptics.notificationAsync(notificationType);
    } catch {
      // Ignore haptic errors
    }
  },

  /**
   * Selection feedback
   * Use for: Picker selection, scrolling
   */
  async selection(): Promise<void> {
    if (!hapticsEnabled) return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // Ignore haptic errors
    }
  },

  /**
   * Celebration pattern - multiple vibrations
   * Use for: Run completion, major achievements
   */
  async celebration(): Promise<void> {
    if (!hapticsEnabled) return;
    try {
      // Pattern: success → light → medium → heavy
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await delay(100);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await delay(100);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await delay(100);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Ignore haptic errors
    }
  },

  /**
   * Achievement unlock pattern
   * Use for: Unlocking badges, milestones
   */
  async achievement(): Promise<void> {
    if (!hapticsEnabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await delay(150);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await delay(100);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore haptic errors
    }
  },

  /**
   * Countdown pattern - 3 ticks
   * Use for: Run countdown timer
   */
  async countdown(number: 3 | 2 | 1 | 'go'): Promise<void> {
    if (!hapticsEnabled) return;
    try {
      if (number === 'go') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      // Ignore haptic errors
    }
  },

  // ============== SOUND EFFECTS ==============

  /**
   * Play celebration sounds
   */
  async playCelebration(): Promise<void> {
    await SoundService.playCelebration();
  },

  /**
   * Play achievement sound
   */
  async playAchievement(): Promise<void> {
    await SoundService.playAchievement();
  },

  /**
   * Play button click
   */
  async playClick(): Promise<void> {
    await SoundService.playClick();
  },

  /**
   * Play countdown beep
   */
  async playCountdown(number: 3 | 2 | 1 | 'go'): Promise<void> {
    if (number === 'go') {
      await SoundService.playStart();
    } else {
      await SoundService.playCountdown(number);
    }
  },

  /**
   * Play zone capture sound
   */
  async playZoneCapture(): Promise<void> {
    await SoundService.playZoneCapture();
  },

  // ============== COMBINED EFFECTS ==============

  /**
   * Full celebration: confetti + haptics + sound
   */
  async fullCelebration(): Promise<void> {
    await Promise.all([
      this.celebration(),
      this.playCelebration(),
    ]);
  },

  /**
   * Full achievement: haptics + sound
   */
  async fullAchievement(): Promise<void> {
    await Promise.all([
      this.achievement(),
      this.playAchievement(),
    ]);
  },

  /**
   * Button press with feedback
   */
  async buttonPress(type: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
    await Promise.all([
      this.playClick(),
      type === 'light' ? this.lightTap() : 
      type === 'medium' ? this.mediumTap() : 
      this.heavyTap()
    ]);
  },

  /**
   * Countdown sequence: 3, 2, 1, GO!
   */
  async countdownSequence(): Promise<void> {
    for (const num of [3, 2, 1] as const) {
      await Promise.all([
        this.countdown(num),
        this.playCountdown(num),
      ]);
      await delay(800);
    }
    await Promise.all([
      this.countdown('go'),
      this.playCountdown('go'),
    ]);
  },
};

// Helper delay function
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default FeedbackService;
