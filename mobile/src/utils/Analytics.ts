/**
 * Analytics System
 * Tracks user behavior, screen views, and custom events
 * Supports offline storage and batch uploading
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { Logger } from './Logger';

interface AnalyticsEvent {
  id: string;
  name: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

interface AnalyticsSession {
  id: string;
  startTime: number;
  endTime?: number;
  screenViews: ScreenView[];
}

interface ScreenView {
  screen: string;
  timestamp: number;
  duration?: number;
}

interface AnalyticsConfig {
  batchSize?: number;
  flushInterval?: number;
  enableOfflineStorage?: boolean;
  debug?: boolean;
}

const DEFAULT_CONFIG: AnalyticsConfig = {
  batchSize: 20,
  flushInterval: 30000, // 30 seconds
  enableOfflineStorage: true,
  debug: __DEV__,
};

const EVENTS_KEY = '@inv_analytics_events';
const SESSION_KEY = '@inv_analytics_session';

class Analytics {
  private config: AnalyticsConfig;
  private events: AnalyticsEvent[] = [];
  private session: AnalyticsSession;
  private currentScreen: string | null = null;
  private screenStartTime: number = 0;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private userId: string | null = null;

  constructor(config: AnalyticsConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.session = this.createSession();
    this.init();
  }

  /**
   * Initialize analytics
   */
  private async init() {
    await this.loadStoredEvents();
    this.startFlushTimer();
    
    if (this.config.debug) {
      Logger.info('Analytics initialized');
    }
  }

  /**
   * Create new session
   */
  private createSession(): AnalyticsSession {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      screenViews: [],
    };
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string) {
    this.userId = userId;
    if (this.config.debug) {
      Logger.debug('Analytics: User ID set', userId);
    }
  }

  /**
   * Clear user ID (on logout)
   */
  clearUserId() {
    this.userId = null;
  }

  /**
   * Track screen view
   */
  screen(screenName: string, properties?: Record<string, any>) {
    // End previous screen tracking
    if (this.currentScreen && this.screenStartTime) {
      const duration = Date.now() - this.screenStartTime;
      const lastView = this.session.screenViews[this.session.screenViews.length - 1];
      if (lastView) {
        lastView.duration = duration;
      }
    }

    // Start new screen tracking
    this.currentScreen = screenName;
    this.screenStartTime = Date.now();

    this.session.screenViews.push({
      screen: screenName,
      timestamp: Date.now(),
    });

    // Track as event
    this.track('screen_view', {
      screen: screenName,
      ...properties,
    });

    if (this.config.debug) {
      Logger.debug('Analytics: Screen view', screenName);
    }
  }

  /**
   * Track custom event
   */
  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: eventName,
      properties: properties || {},
      timestamp: Date.now(),
      sessionId: this.session.id,
      userId: this.userId || undefined,
    };

    this.events.push(event);

    if (this.config.debug) {
      Logger.debug('Analytics: Event', eventName, properties);
    }

    // Flush if batch size reached
    if (this.events.length >= (this.config.batchSize || 20)) {
      this.flush();
    }
  }

  /**
   * Track user action
   */
  action(actionName: string, properties?: Record<string, any>) {
    this.track('user_action', {
      action: actionName,
      ...properties,
    });
  }

  /**
   * Track error
   */
  error(error: Error, context?: string) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  /**
   * Start flush timer
   */
  private startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      if (this.events.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval || 30000);
  }

  /**
   * Flush events to server
   */
  async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // In production, send to analytics service
      if (!this.config.debug) {
        // Example: Send to Firebase Analytics, Amplitude, Mixpanel, etc.
        await this.sendToAnalyticsService(eventsToSend);
      } else {
        Logger.info('Analytics: Flushing events', eventsToSend.length);
      }
    } catch (error) {
      Logger.error('Analytics: Failed to flush events', error);
      // Restore events to queue
      this.events = [...eventsToSend, ...this.events];
      await this.saveEvents();
    }
  }

  /**
   * Send events to analytics service
   */
  private async sendToAnalyticsService(events: AnalyticsEvent[]): Promise<void> {
    // TODO: Integrate with your analytics provider
    // Examples:
    // - Firebase Analytics
    // - Amplitude
    // - Mixpanel
    // - Custom backend

    // Placeholder implementation
    Logger.info(`Sending ${events.length} events to analytics`);
  }

  /**
   * Load stored events from storage
   */
  private async loadStoredEvents() {
    try {
      const stored = await AsyncStorage.getItem(EVENTS_KEY);
      if (stored) {
        this.events = JSON.parse(stored);
        Logger.info(`Loaded ${this.events.length} stored events`);
      }
    } catch (error) {
      Logger.error('Analytics: Failed to load stored events', error);
    }
  }

  /**
   * Save events to storage
   */
  private async saveEvents() {
    try {
      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(this.events));
    } catch (error) {
      Logger.error('Analytics: Failed to save events', error);
    }
  }

  /**
   * End current session
   */
  async endSession() {
    this.session.endTime = Date.now();
    await this.flush();
    
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    Logger.info('Analytics: Session ended');
  }

  /**
   * Get analytics summary
   */
  getSummary() {
    return {
      sessionId: this.session.id,
      sessionDuration: Date.now() - this.session.startTime,
      eventsInQueue: this.events.length,
      screenViews: this.session.screenViews.length,
      currentScreen: this.currentScreen,
    };
  }
}

// Singleton instance
export const analytics = new Analytics();

/**
 * Hook for analytics in components
 */
export function useAnalytics() {
  return {
    screen: analytics.screen.bind(analytics),
    track: analytics.track.bind(analytics),
    action: analytics.action.bind(analytics),
    error: analytics.error.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    clearUserId: analytics.clearUserId.bind(analytics),
    getSummary: analytics.getSummary.bind(analytics),
  };
}

/**
 * Hook to track screen views automatically
 */
export function useScreenTracking(screenName: string, properties?: Record<string, any>) {
  const { screen } = useAnalytics();

  useEffect(() => {
    screen(screenName, properties);
  }, [screenName]);
}

export default analytics;
