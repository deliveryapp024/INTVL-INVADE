/**
 * Share Service
 * Create and share content to social media
 */

import { Share, Platform, View, Text } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { DeepLinkService } from './DeepLinkService';

export interface ShareRunData {
  distance: number; // meters
  duration: number; // seconds
  pace: number | null; // seconds per km
  zones?: number;
  calories?: number;
}

export interface ShareCardOptions {
  theme?: 'default' | 'victory' | 'challenge';
  includeMap?: boolean;
  includePhoto?: boolean;
}

export const ShareService = {
  /**
   * Share a run to social media
   */
  async shareRun(data: ShareRunData, options: ShareCardOptions = {}): Promise<boolean> {
    try {
      const message = this.generateRunMessage(data);
      const link = DeepLinkService.generateReferralLink('RUN123');
      
      const shareContent = {
        message: `${message}\n\n${link}`,
        title: 'My Zone Capture! 🏃',
      };

      if (Platform.OS === 'ios') {
        // On iOS, use native share sheet
        const result = await Share.share(shareContent);
        return result.action === Share.sharedAction;
      } else {
        // On Android
        const result = await Share.share(shareContent);
        return result.action === Share.sharedAction;
      }
    } catch (error) {
      console.log('Share error:', error);
      return false;
    }
  },

  /**
   * Share to Instagram Stories
   */
  async shareToInstagramStory(imageUri: string): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        // Instagram Stories URL scheme for iOS
        const url = `instagram-stories://share?source_application=com.invadetheland.app`;
        const canOpen = await Linking.canOpenURL(url);
        
        if (canOpen) {
          await Linking.openURL(url);
          return true;
        }
      }
      
      // Fallback: Share image
      await Sharing.shareAsync(imageUri, {
        mimeType: 'image/png',
        dialogTitle: 'Share to Instagram',
      });
      return true;
    } catch (error) {
      console.log('Instagram share error:', error);
      return false;
    }
  },

  /**
   * Share referral code
   */
  async shareReferral(code: string): Promise<boolean> {
    try {
      const link = DeepLinkService.generateReferralLink(code);
      const message = `🏃 Join me on INVADE - The Territory Running Game!\n\nUse my code: ${code}\n\nDownload: ${link}`;

      const result = await Share.share({
        message,
        title: 'Join INVADE! 🏃',
      });

      return result.action === Share.sharedAction;
    } catch (error) {
      console.log('Referral share error:', error);
      return false;
    }
  },

  /**
   * Share leaderboard rank
   */
  async shareLeaderboardRank(rank: number, zoneName: string): Promise<boolean> {
    try {
      const link = DeepLinkService.generateWebFallback('leaderboard');
      const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏅';
      
      const message = `${rankEmoji} I'm ranked #${rank} on the ${zoneName} leaderboard!\n\nCan you beat me? Join the invasion!\n\n${link}`;

      const result = await Share.share({
        message,
        title: 'My Leaderboard Rank! 🏆',
      });

      return result.action === Share.sharedAction;
    } catch (error) {
      console.log('Leaderboard share error:', error);
      return false;
    }
  },

  /**
   * Share achievement
   */
  async shareAchievement(achievementName: string, description: string): Promise<boolean> {
    try {
      const link = DeepLinkService.generateWebFallback('achievements');
      const message = `🏆 Achievement Unlocked: ${achievementName}!\n\n${description}\n\nJoin me on INVADE! ${link}`;

      const result = await Share.share({
        message,
        title: 'Achievement Unlocked! 🏆',
      });

      return result.action === Share.sharedAction;
    } catch (error) {
      console.log('Achievement share error:', error);
      return false;
    }
  },

  /**
   * Generate shareable run card as image (placeholder)
   */
  async generateRunCard(data: ShareRunData, options: ShareCardOptions = {}): Promise<string | null> {
    try {
      // This is a placeholder - in production, you'd use:
      // - react-native-view-shot to capture a view
      // - expo-image-manipulator to add overlays
      // - Custom canvas drawing with react-native-skia
      
      // For now, return null and use text-based sharing
      console.log('Generate card for:', data, options);
      return null;
    } catch (error) {
      console.log('Card generation error:', error);
      return null;
    }
  },

  /**
   * Generate run message text
   */
  generateRunMessage(data: ShareRunData): string {
    const km = (data.distance / 1000).toFixed(2);
    const mins = Math.floor(data.duration / 60);
    const secs = data.duration % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    let message = `🏃 Zone Capture Complete!\n\n`;
    message += `📍 Distance: ${km} km\n`;
    message += `⏱️ Time: ${timeStr}\n`;
    
    if (data.pace) {
      const paceMins = Math.floor(data.pace / 60);
      const paceSecs = Math.round(data.pace % 60);
      message += `⚡ Pace: ${paceMins}'${paceSecs.toString().padStart(2, '0')}" /km\n`;
    }
    
    if (data.zones) {
      message += `🎯 Zones: ${data.zones}\n`;
    }
    
    if (data.calories) {
      message += `🔥 Calories: ${data.calories}\n`;
    }

    return message;
  },

  /**
   * Generate referral invite message
   */
  generateInviteMessage(code: string, inviterName: string): string {
    return `🎮 ${inviterName} invited you to INVADE!\n\n` +
           `🏃 Turn your runs into territory battles\n` +
           `🗺️ Capture zones in your city\n` +
           `🏆 Compete on leaderboards\n\n` +
           `Use code: ${code} for +5 bonus zones!\n` +
           `Download now and start the invasion! 🚀`;
  },

  /**
   * Share via WhatsApp
   */
  async shareViaWhatsApp(message: string): Promise<boolean> {
    try {
      const { Linking } = await import('react-native');
      const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Share via Telegram
   */
  async shareViaTelegram(message: string): Promise<boolean> {
    try {
      const { Linking } = await import('react-native');
      const url = `tg://msg_url?url=&text=${encodeURIComponent(message)}`;
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
};

// Lazy import for Linking
import { Linking } from 'react-native';

export default ShareService;
