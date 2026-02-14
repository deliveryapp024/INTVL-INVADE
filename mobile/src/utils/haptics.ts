/**
 * Haptic Feedback Utility
 * Provides consistent haptic feedback across the app
 */

import * as Haptics from 'expo-haptics';

export type HapticType = 
  | 'light'
  | 'medium' 
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

/**
 * Trigger haptic feedback
 */
export async function triggerHaptic(type: HapticType = 'light'): Promise<void> {
  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'selection':
        await Haptics.selectionAsync();
        break;
    }
  } catch (error) {
    // Haptics not available on this device
    console.log('Haptics not available');
  }
}

/**
 * Haptic feedback presets for common actions
 */
export const HapticsPreset = {
  // Button presses
  buttonPress: () => triggerHaptic('light'),
  buttonPrimary: () => triggerHaptic('medium'),
  
  // Success actions
  success: () => triggerHaptic('success'),
  achievement: () => triggerHaptic('success'),
  zoneCaptured: () => triggerHaptic('success'),
  
  // Errors
  error: () => triggerHaptic('error'),
  validationError: () => triggerHaptic('warning'),
  
  // Selection
  tabChange: () => triggerHaptic('selection'),
  listItem: () => triggerHaptic('light'),
  
  // Actions
  share: () => triggerHaptic('medium'),
  copy: () => triggerHaptic('light'),
  delete: () => triggerHaptic('warning'),
  
  // Game mechanics
  runStart: () => triggerHaptic('medium'),
  runPause: () => triggerHaptic('light'),
  runComplete: () => triggerHaptic('success'),
  checkpoint: () => triggerHaptic('light'),
  streakMilestone: () => triggerHaptic('heavy'),
};

export default triggerHaptic;
