/**
 * Deep Link Service
 * Handle deep links for referrals, runs, and sharing
 */

import { Linking, Platform } from 'react-native';
import * as LinkingExpo from 'expo-linking';

export interface DeepLinkData {
  type: 'referral' | 'run' | 'zone' | 'profile' | 'leaderboard' | 'auth';
  code?: string;
  id?: string;
  access_token?: string;
  refresh_token?: string;
  params?: Record<string, string>;
}

export const DeepLinkService = {
  /**
   * Get the initial URL that launched the app
   */
  async getInitialURL(): Promise<string | null> {
    return await Linking.getInitialURL();
  },

  /**
   * Parse a deep link URL
   */
  parseURL(url: string): DeepLinkData | null {
    try {
      console.log('Parsing deep link URL:', url);
      
      // Handle universal links and custom schemes
      // Examples:
      // invadetheland://referral/CODE123
      // https://invadetheland.app/referral/CODE123
      // com.intvlinvade.app://auth/callback?access_token=xxx&refresh_token=xxx

      const parsed = LinkingExpo.parse(url);
      console.log('Parsed URL:', parsed);
      
      const path = parsed.path || '';
      const pathParts = path.split('/').filter(Boolean);
      
      // Check for OAuth callback
      if (url.includes('auth/callback') || (parsed.hostname === 'auth' && pathParts[0] === 'callback')) {
        console.log('Detected OAuth callback');
        return {
          type: 'auth',
          access_token: parsed.queryParams?.access_token as string,
          refresh_token: parsed.queryParams?.refresh_token as string,
          params: parsed.queryParams as Record<string, string>,
        };
      }

      if (pathParts.length === 0) return null;

      const [type, identifier] = pathParts;

      switch (type) {
        case 'referral':
          return {
            type: 'referral',
            code: identifier,
            params: parsed.queryParams as Record<string, string>,
          };
        case 'run':
          return {
            type: 'run',
            id: identifier,
            params: parsed.queryParams as Record<string, string>,
          };
        case 'zone':
          return {
            type: 'zone',
            id: identifier,
            params: parsed.queryParams as Record<string, string>,
          };
        case 'profile':
          return {
            type: 'profile',
            id: identifier,
            params: parsed.queryParams as Record<string, string>,
          };
        case 'leaderboard':
          return {
            type: 'leaderboard',
            params: parsed.queryParams as Record<string, string>,
          };
        case 'auth':
          // Handle OAuth callback
          return {
            type: 'auth',
            access_token: parsed.queryParams?.access_token as string,
            refresh_token: parsed.queryParams?.refresh_token as string,
            params: parsed.queryParams as Record<string, string>,
          };
        default:
          return null;
      }
    } catch (error) {
      console.log('Error parsing deep link:', error);
      return null;
    }
  },

  /**
   * Generate a referral deep link
   */
  generateReferralLink(code: string): string {
    const prefix = LinkingExpo.createURL('/');
    return `${prefix}referral/${code}`;
  },

  /**
   * Generate a run share link
   */
  generateRunLink(runId: string): string {
    const prefix = LinkingExpo.createURL('/');
    return `${prefix}run/${runId}`;
  },

  /**
   * Generate a profile link
   */
  generateProfileLink(userId: string): string {
    const prefix = LinkingExpo.createURL('/');
    return `${prefix}profile/${userId}`;
  },

  /**
   * Generate a web fallback URL
   */
  generateWebFallback(path: string): string {
    return `https://invadetheland.app/${path}`;
  },

  /**
   * Open a URL
   */
  async openURL(url: string): Promise<boolean> {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return true;
      }
      return false;
    } catch (error) {
      console.log('Error opening URL:', error);
      return false;
    }
  },

  /**
   * Handle referral code from deep link
   */
  async handleReferral(code: string): Promise<boolean> {
    try {
      console.log('Processing referral code:', code);
      
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.setItem('@inv_pending_referral', code);
      
      return true;
    } catch (error) {
      console.log('Error handling referral:', error);
      return false;
    }
  },

  /**
   * Check for pending referral
   */
  async checkPendingReferral(): Promise<string | null> {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const code = await AsyncStorage.getItem('@inv_pending_referral');
      if (code) {
        await AsyncStorage.removeItem('@inv_pending_referral');
      }
      return code;
    } catch {
      return null;
    }
  },

  /**
   * Add deep link listener
   */
  addEventListener(callback: (url: string) => void) {
    return Linking.addEventListener('url', ({ url }) => callback(url));
  },

  /**
   * Subscribe to deep links
   */
  subscribe(handler: (data: DeepLinkData) => void) {
    const subscription = this.addEventListener((url) => {
      const data = this.parseURL(url);
      if (data) {
        handler(data);
      }
    });

    // Also check initial URL
    this.getInitialURL().then((url) => {
      if (url) {
        const data = this.parseURL(url);
        if (data) {
          handler(data);
        }
      }
    });

    return subscription;
  },
};

export default DeepLinkService;
