/**
 * Referral Service - Handles invite codes and referral rewards
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, fetchWithFallback } from '../../services/api';

const REFERRAL_STORAGE_KEY = '@invtl_referral_data';
const USER_ID = 'test-user-id';

export interface ReferralData {
  myCode: string;
  totalReferrals: number;
  pendingReferrals: number;
  rewardsEarned: number;
  referredBy?: string;
  referredUsers: ReferredUser[];
}

export interface ReferredUser {
  userId: string;
  name: string;
  status: 'pending' | 'completed';
  joinedAt?: string;
  rewardEarned: boolean;
}

// Mock referral data for development
const MOCK_REFERRAL_DATA: ReferralData = {
  myCode: 'INVTL' + Math.random().toString(36).substring(2, 6).toUpperCase(),
  totalReferrals: 3,
  pendingReferrals: 1,
  rewardsEarned: 10,
  referredUsers: [
    {
      userId: 'user1',
      name: 'Rahul M.',
      status: 'completed',
      joinedAt: '2026-01-15',
      rewardEarned: true,
    },
    {
      userId: 'user2',
      name: 'Priya K.',
      status: 'completed',
      joinedAt: '2026-01-20',
      rewardEarned: true,
    },
    {
      userId: 'user3',
      name: 'Arjun S.',
      status: 'pending',
      rewardEarned: false,
    },
  ],
};

/**
 * Generate a unique referral code for the user
 */
function generateReferralCode(userId: string): string {
  // Create code from user ID hash + random
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `INVTL${random}${hash % 1000}`;
}

/**
 * Get or create referral data for the user
 */
export async function getReferralData(): Promise<ReferralData> {
  try {
    // Try to get from storage first
    const stored = await AsyncStorage.getItem(REFERRAL_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Try to fetch from API
    const { data } = await fetchWithFallback<{
      status: string;
      data: ReferralData;
    }>(
      `${API_BASE_URL}/referrals/${USER_ID}`,
      {},
      { status: 'success', data: MOCK_REFERRAL_DATA }
    );

    if (data?.data) {
      await AsyncStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(data.data));
      return data.data;
    }

    // Create new referral data
    const newData: ReferralData = {
      myCode: generateReferralCode(USER_ID),
      totalReferrals: 0,
      pendingReferrals: 0,
      rewardsEarned: 0,
      referredUsers: [],
    };

    await AsyncStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(newData));
    return newData;
  } catch (error) {
    console.error('Error getting referral data:', error);
    return MOCK_REFERRAL_DATA;
  }
}

/**
 * Save referral data
 */
export async function saveReferralData(data: ReferralData): Promise<void> {
  try {
    await AsyncStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving referral data:', error);
  }
}

/**
 * Apply a referral code when signing up
 */
export async function applyReferralCode(code: string): Promise<boolean> {
  try {
    const { data, error } = await fetchWithFallback<{
      status: string;
      valid: boolean;
      referrerName?: string;
    }>(
      `${API_BASE_URL}/referrals/validate`,
      {
        method: 'POST',
        body: JSON.stringify({ code, userId: USER_ID }),
      }
    );

    if (error || !data?.valid) {
      return false;
    }

    // Store that we were referred
    const referralData = await getReferralData();
    referralData.referredBy = code;
    await saveReferralData(referralData);

    return true;
  } catch (error) {
    console.error('Error applying referral code:', error);
    return false;
  }
}

/**
 * Claim referral reward when referred friend completes first run
 */
export async function claimReferralReward(referredUserId: string): Promise<boolean> {
  try {
    const { data } = await fetchWithFallback<{
      status: string;
      success: boolean;
      reward?: number;
    }>(
      `${API_BASE_URL}/referrals/claim`,
      {
        method: 'POST',
        body: JSON.stringify({
          referrerId: USER_ID,
          referredUserId,
        }),
      }
    );

    if (data?.success) {
      // Update local data
      const referralData = await getReferralData();
      const user = referralData.referredUsers.find(u => u.userId === referredUserId);
      if (user) {
        user.rewardEarned = true;
        referralData.rewardsEarned += data.reward || 5;
        referralData.pendingReferrals = Math.max(0, referralData.pendingReferrals - 1);
        await saveReferralData(referralData);
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error claiming referral reward:', error);
    return false;
  }
}

/**
 * Get referral stats
 */
export async function getReferralStats(): Promise<{
  totalReferrals: number;
  rewardsEarned: number;
  pendingRewards: number;
}> {
  const data = await getReferralData();
  return {
    totalReferrals: data.totalReferrals,
    rewardsEarned: data.rewardsEarned,
    pendingRewards: data.pendingReferrals,
  };
}

/**
 * Share referral link
 */
export function getReferralLink(code: string): string {
  return `https://invtl.app/join?code=${code}`;
}

/**
 * Parse referral code from deep link
 */
export function parseReferralCode(url: string): string | null {
  // Handle different URL formats
  // https://invtl.app/join?code=INVTL123
  // invtl://join?code=INVTL123
  
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('code');
  } catch {
    // Fallback for simple parsing
    const match = url.match(/[?&]code=([^&]+)/);
    return match ? match[1] : null;
  }
}

/**
 * Mock function to simulate a friend joining
 * (For demo purposes)
 */
export async function simulateFriendJoin(name: string): Promise<void> {
  const data = await getReferralData();
  
  const newUser: ReferredUser = {
    userId: `user_${Date.now()}`,
    name,
    status: 'pending',
    rewardEarned: false,
  };
  
  data.referredUsers.push(newUser);
  data.totalReferrals += 1;
  data.pendingReferrals += 1;
  
  await saveReferralData(data);
}
