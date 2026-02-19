// GamificationService.ts - XP, Levels, Badges, Leaderboards
import { supabase } from '../lib/supabase';
import { FeedbackService } from './FeedbackService';

export interface Level {
  level: number;
  title: string;
  xpRequired: number;
  xpToNext: number;
  color: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: 'distance' | 'streak' | 'zone' | 'social' | 'challenge' | 'special';
  iconUrl?: string;
  color: string;
  xpReward: number;
  isUnlocked: boolean;
  earnedAt?: Date;
  progress?: number;
  requirementValue: number;
}

export interface UserProgress {
  level: number;
  title: string;
  currentXP: number;
  xpForNextLevel: number;
  xpProgress: number; // 0-100
  totalBadges: number;
  badgesThisMonth: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  distance: number;
  runs: number;
  zones: number;
  xp: number;
  isCurrentUser: boolean;
}

export interface WeeklyGoal {
  distance: { current: number; target: number };
  runs: { current: number; target: number };
  zones: { current: number; target: number };
  time: { current: number; target: number };
}

class GamificationService {
  private static instance: GamificationService;

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  // ==========================================
  // XP & LEVEL SYSTEM
  // ==========================================

  async getUserProgress(userId: string): Promise<UserProgress | null> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('level, xp, total_distance, total_runs')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Error fetching user progress:', error);
      return null;
    }

    const { data: levelData } = await supabase
      .from('levels')
      .select('*')
      .eq('level', profile.level)
      .single();

    if (!levelData) return null;

    const xpForNextLevel = levelData.xp_to_next;
    const xpProgress = Math.min(100, Math.round((profile.xp / xpForNextLevel) * 100));

    // Get badge count
    const { count: totalBadges } = await supabase
      .from('user_badges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: badgesThisMonth } = await supabase
      .from('user_badges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('earned_at', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString());

    return {
      level: profile.level,
      title: levelData.title,
      currentXP: profile.xp,
      xpForNextLevel,
      xpProgress,
      totalBadges: totalBadges || 0,
      badgesThisMonth: badgesThisMonth || 0,
    };
  }

  async addXP(userId: string, amount: number, source: string): Promise<number> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, level')
      .eq('id', userId)
      .single();

    if (!profile) return 0;

    const newXP = profile.xp + amount;
    let newLevel = profile.level;

    // Check for level up
    const { data: nextLevel } = await supabase
      .from('levels')
      .select('*')
      .eq('level', profile.level + 1)
      .single();

    if (nextLevel && newXP >= nextLevel.xp_required) {
      newLevel = nextLevel.level;
      
      // Trigger level up notification
      await FeedbackService.notification('success');
      
      // Create notification
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'level_up',
        title: '🎉 Level Up!',
        body: `Congratulations! You reached Level ${newLevel} - ${nextLevel.title}`,
        data: { level: newLevel, title: nextLevel.title },
      });
    }

    // Update profile
    await supabase
      .from('profiles')
      .update({ xp: newXP, level: newLevel })
      .eq('id', userId);

    return newXP;
  }

  calculateXPForActivity(distance: number, duration: number, zonesCaptured: number): number {
    let xp = 0;
    
    // Base XP: 10 XP per km
    xp += Math.floor(distance / 1000) * 10;
    
    // Zone capture XP: 25 XP per zone
    xp += zonesCaptured * 25;
    
    // Streak bonus: Calculated separately
    
    // First run of the day bonus: 50 XP
    // (handled in activity completion)
    
    return xp;
  }

  // ==========================================
  // BADGE SYSTEM
  // ==========================================

  async getAllBadges(userId: string): Promise<Badge[]> {
    // Get all badge definitions
    const { data: allBadges } = await supabase
      .from('badges')
      .select('*')
      .order('category');

    if (!allBadges) return [];

    // Get user's earned badges
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', userId);

    const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);
    const earnedDates = new Map(
      userBadges?.map(ub => [ub.badge_id, new Date(ub.earned_at)]) || []
    );

    // Get user's stats for progress calculation
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_distance, total_runs, current_streak, total_time')
      .eq('id', userId)
      .single();

    return allBadges.map(badge => {
      const isUnlocked = earnedBadgeIds.has(badge.id);
      let progress = 0;

      // Calculate progress based on badge category
      if (!isUnlocked && profile) {
        switch (badge.requirement_type) {
          case 'total_distance':
            progress = Math.min(100, Math.round((profile.total_distance / badge.requirement_value) * 100));
            break;
          case 'total_runs':
            progress = Math.min(100, Math.round((profile.total_runs / badge.requirement_value) * 100));
            break;
          case 'consecutive_days':
            progress = Math.min(100, Math.round((profile.current_streak / badge.requirement_value) * 100));
            break;
        }
      } else if (isUnlocked) {
        progress = 100;
      }

      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        category: badge.category,
        iconUrl: badge.icon_url,
        color: badge.color || '#00D1FF',
        xpReward: badge.xp_reward,
        isUnlocked,
        earnedAt: earnedDates.get(badge.id),
        progress,
        requirementValue: badge.requirement_value,
      };
    });
  }

  async getBadgesByCategory(userId: string, category: Badge['category']): Promise<Badge[]> {
    const allBadges = await this.getAllBadges(userId);
    return allBadges.filter(b => b.category === category);
  }

  async checkAndAwardBadges(userId: string, activityData: {
    distance: number;
    duration: number;
    zonesCaptured: number;
    isFirstRunOfDay: boolean;
  }): Promise<Badge[]> {
    const earnedBadges: Badge[] = [];

    // Get user's current stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_distance, total_runs, current_streak, total_time')
      .eq('id', userId)
      .single();

    if (!profile) return earnedBadges;

    // Get already earned badges
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);

    // Get all badge definitions
    const { data: allBadges } = await supabase
      .from('badges')
      .select('*');

    if (!allBadges) return earnedBadges;

    // Check each badge
    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let shouldAward = false;

      switch (badge.requirement_type) {
        case 'single_run_distance':
          shouldAward = activityData.distance >= badge.requirement_value;
          break;
        case 'total_distance':
          shouldAward = profile.total_distance >= badge.requirement_value;
          break;
        case 'consecutive_days':
          shouldAward = profile.current_streak >= badge.requirement_value;
          break;
        case 'zones_captured':
          // Get total zones captured
          const { count } = await supabase
            .from('zone_ownership')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
          shouldAward = (count || 0) >= badge.requirement_value;
          break;
      }

      if (shouldAward) {
        // Award badge
        await this.awardBadge(userId, badge.id);
        
        earnedBadges.push({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          category: badge.category,
          color: badge.color || '#00D1FF',
          xpReward: badge.xp_reward,
          isUnlocked: true,
          earnedAt: new Date(),
          progress: 100,
          requirementValue: badge.requirement_value,
        });

        // Award XP for badge
        await this.addXP(userId, badge.xp_reward, 'badge_earned');
      }
    }

    return earnedBadges;
  }

  private async awardBadge(userId: string, badgeId: string): Promise<void> {
    await supabase.from('user_badges').insert({
      user_id: userId,
      badge_id: badgeId,
      is_new: true,
    });

    // Create notification
    const { data: badge } = await supabase
      .from('badges')
      .select('name')
      .eq('id', badgeId)
      .single();

    if (badge) {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'badge_earned',
        title: '🏆 Badge Unlocked!',
        body: `You earned the "${badge.name}" badge!`,
        data: { badge_id: badgeId, badge_name: badge.name },
      });
    }

    await FeedbackService.notification('success');
  }

  // ==========================================
  // LEADERBOARDS
  // ==========================================

  async getLeaderboard(
    type: 'city' | 'club' | 'friends' | 'global',
    period: 'week' | 'month' | 'all_time',
    userId: string,
    limit: number = 50
  ): Promise<LeaderboardEntry[]> {
    let query = supabase
      .from('profiles')
      .select('id, username, avatar_url, total_distance, total_runs, xp');

    // Apply filters based on type
    if (type === 'friends') {
      // Get friend IDs first
      const { data: friendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted');

      const friendIds = friendships?.map(f => 
        f.requester_id === userId ? f.addressee_id : f.requester_id
      ) || [];
      
      friendIds.push(userId); // Include self
      
      query = query.in('id', friendIds);
    }

    // Apply time period filter
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      // This would require a more complex query with activity data
    }

    // Order by XP (or distance for specific leaderboards)
    query = query.order('xp', { ascending: false }).limit(limit);

    const { data: profiles, error } = await query;

    if (error || !profiles) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    // Get zone counts for each user
    const leaderboardData: LeaderboardEntry[] = await Promise.all(
      profiles.map(async (profile, index) => {
        const { count: zonesCount } = await supabase
          .from('zone_ownership')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        return {
          rank: index + 1,
          userId: profile.id,
          username: profile.username,
          avatarUrl: profile.avatar_url,
          distance: profile.total_distance || 0,
          runs: profile.total_runs || 0,
          zones: zonesCount || 0,
          xp: profile.xp || 0,
          isCurrentUser: profile.id === userId,
        };
      })
    );

    // Re-sort by XP and re-assign ranks
    leaderboardData.sort((a, b) => b.xp - a.xp);
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboardData;
  }

  async getUserRank(userId: string, type: 'city' | 'global' = 'global'): Promise<number> {
    // Get user's XP
    const { data: user } = await supabase
      .from('profiles')
      .select('xp')
      .eq('id', userId)
      .single();

    if (!user) return 0;

    // Count users with higher XP
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('xp', user.xp);

    return (count || 0) + 1;
  }

  // ==========================================
  // WEEKLY GOALS
  // ==========================================

  async getWeeklyGoals(userId: string): Promise<WeeklyGoal> {
    const weekStart = this.getWeekStart();
    
    const { data: goal } = await supabase
      .from('weekly_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart.toISOString().split('T')[0])
      .single();

    if (goal) {
      return {
        distance: { current: goal.distance_actual || 0, target: goal.distance_goal || 0 },
        runs: { current: goal.runs_actual || 0, target: goal.runs_goal || 0 },
        zones: { current: goal.zones_actual || 0, target: goal.zones_goal || 0 },
        time: { current: goal.time_actual || 0, target: goal.time_goal || 0 },
      };
    }

    // Return default goals if none set
    return {
      distance: { current: 0, target: 25 },
      runs: { current: 0, target: 4 },
      zones: { current: 0, target: 10 },
      time: { current: 0, target: 180 },
    };
  }

  async setWeeklyGoals(
    userId: string,
    goals: { distance?: number; runs?: number; zones?: number; time?: number }
  ): Promise<void> {
    const weekStart = this.getWeekStart();
    
    await supabase.from('weekly_goals').upsert({
      user_id: userId,
      week_start: weekStart.toISOString().split('T')[0],
      distance_goal: goals.distance,
      runs_goal: goals.runs,
      zones_goal: goals.zones,
      time_goal: goals.time,
    }, {
      onConflict: 'user_id,week_start',
    });
  }

  async updateGoalProgress(
    userId: string,
    activityData: { distance: number; duration: number; zones: number }
  ): Promise<void> {
    const weekStart = this.getWeekStart();
    
    const { data: goal } = await supabase
      .from('weekly_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart.toISOString().split('T')[0])
      .single();

    if (!goal) return;

    const updates: any = {
      distance_actual: (goal.distance_actual || 0) + (activityData.distance / 1000),
      time_actual: (goal.time_actual || 0) + Math.floor(activityData.duration / 60),
    };

    if (activityData.zones > 0) {
      updates.zones_actual = (goal.zones_actual || 0) + activityData.zones;
    }

    // Count runs (any completed activity counts as a run)
    updates.runs_actual = (goal.runs_actual || 0) + 1;

    await supabase
      .from('weekly_goals')
      .update(updates)
      .eq('id', goal.id);

    // Check if all goals completed
    const isCompleted = 
      updates.distance_actual >= goal.distance_goal &&
      updates.runs_actual >= goal.runs_goal &&
      updates.zones_actual >= goal.zones_goal;

    if (isCompleted && !goal.is_completed) {
      await supabase
        .from('weekly_goals')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', goal.id);

      // Award bonus XP for completing all goals
      await this.addXP(userId, 200, 'weekly_goals_completed');

      // Create notification
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'goals_completed',
        title: '🎯 Weekly Goals Completed!',
        body: 'You completed all your weekly goals! +200 XP',
      });
    }
  }

  private getWeekStart(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const diff = now.getDate() - dayOfWeek;
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  // ==========================================
  // STREAK MANAGEMENT
  // ==========================================

  async updateStreak(userId: string): Promise<{ current: number; best: number }> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak, best_streak, streak_updated_at')
      .eq('id', userId)
      .single();

    if (!profile) return { current: 0, best: 0 };

    const lastStreakDate = profile.streak_updated_at ? new Date(profile.streak_updated_at) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStreak = profile.current_streak;

    if (lastStreakDate) {
      const lastDate = new Date(lastStreakDate);
      lastDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Already ran today, streak continues
      } else if (diffDays === 1) {
        // Ran yesterday, increment streak
        newStreak += 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
    } else {
      // First run ever
      newStreak = 1;
    }

    const newBest = Math.max(profile.best_streak || 0, newStreak);

    // Update profile
    await supabase
      .from('profiles')
      .update({
        current_streak: newStreak,
        best_streak: newBest,
        streak_updated_at: today.toISOString(),
      })
      .eq('id', userId);

    // Check for streak badges
    await this.checkAndAwardBadges(userId, {
      distance: 0,
      duration: 0,
      zonesCaptured: 0,
      isFirstRunOfDay: false,
    });

    // Award streak XP
    if (newStreak > profile.current_streak) {
      const streakXP = Math.min(50, newStreak * 5); // Max 50 XP per day
      await this.addXP(userId, streakXP, 'streak_maintained');
    }

    return { current: newStreak, best: newBest };
  }
}

export const gamificationService = GamificationService.getInstance();
