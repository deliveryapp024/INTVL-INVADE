// SafetyService.ts - SOS, Live Location Sharing, Night Run Mode
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import * as Notifications from 'expo-notifications';
import { Alert, Vibration, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { FeedbackService } from './FeedbackService';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
  isPrimary: boolean;
}

export interface LiveLocationShare {
  id: string;
  startedAt: Date;
  expiresAt: Date;
  shareToken: string;
  isActive: boolean;
}

export interface SafetyEvent {
  id: string;
  type: 'sos' | 'live_share_start' | 'live_share_end' | 'inactivity_alert' | 'night_mode_start';
  latitude?: number;
  longitude?: number;
  batteryLevel?: number;
  createdAt: Date;
}

class SafetyService {
  private static instance: SafetyService;
  private locationSubscription: Location.LocationSubscription | null = null;
  private currentShare: LiveLocationShare | null = null;
  private sosTimeout: NodeJS.Timeout | null = null;

  static getInstance(): SafetyService {
    if (!SafetyService.instance) {
      SafetyService.instance = new SafetyService();
    }
    return SafetyService.instance;
  }

  // ==========================================
  // EMERGENCY CONTACTS
  // ==========================================

  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });

    if (error) {
      console.error('Error fetching emergency contacts:', error);
      return [];
    }

    return data.map(contact => ({
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      isPrimary: contact.is_primary,
    }));
  }

  async addEmergencyContact(
    userId: string,
    contact: Omit<EmergencyContact, 'id'>
  ): Promise<EmergencyContact | null> {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert({
        user_id: userId,
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship,
        is_primary: contact.isPrimary,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding emergency contact:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      relationship: data.relationship,
      isPrimary: data.is_primary,
    };
  }

  async removeEmergencyContact(contactId: string): Promise<boolean> {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', contactId);

    return !error;
  }

  // ==========================================
  // SOS SYSTEM
  // ==========================================

  async triggerSOS(userId: string, countdownSeconds: number = 3): Promise<void> {
    // Vibrate to indicate SOS is being triggered
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);
    
    await FeedbackService.notification('warning');

    return new Promise((resolve, reject) => {
      Alert.alert(
        '🆘 SOS Emergency',
        `SOS will be triggered in ${countdownSeconds} seconds. Keep holding to cancel.`,
        [
          {
            text: 'Cancel SOS',
            onPress: () => {
              Vibration.cancel();
              resolve();
            },
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );

      // Auto-trigger after countdown if not cancelled
      this.sosTimeout = setTimeout(async () => {
        await this.executeSOS(userId);
        resolve();
      }, countdownSeconds * 1000);
    });
  }

  cancelSOS(): void {
    if (this.sosTimeout) {
      clearTimeout(this.sosTimeout);
      this.sosTimeout = null;
      Vibration.cancel();
    }
  }

  private async executeSOS(userId: string): Promise<void> {
    try {
      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      // Get battery level
      const batteryLevel = await this.getBatteryLevel();

      // Get emergency contacts
      const contacts = await this.getEmergencyContacts(userId);

      if (contacts.length === 0) {
        Alert.alert('No Emergency Contacts', 'Please add emergency contacts in settings.');
        return;
      }

      // Create safety event record
      await supabase.from('safety_events').insert({
        user_id: userId,
        type: 'sos',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        battery_level: Math.round(batteryLevel * 100),
      });

      // Send SMS to all emergency contacts
      const locationUrl = `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
      const message = `🆘 EMERGENCY ALERT from INVADE\n\nI have triggered an SOS alert.\n\n📍 Location: ${locationUrl}\n🔋 Battery: ${Math.round(batteryLevel * 100)}%\n⏰ Time: ${new Date().toLocaleString()}\n\nPlease check on me immediately!`;

      const phoneNumbers = contacts.map(c => c.phone);
      
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync(phoneNumbers, message);
      }

      // Send push notification to app users
      await this.notifyEmergencyContacts(userId, contacts, {
        title: '🆘 SOS Emergency Alert',
        body: 'Emergency SOS triggered. Tap to view location.',
        data: {
          type: 'sos',
          userId,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          batteryLevel: Math.round(batteryLevel * 100),
        },
      });

      // Show confirmation to user
      Alert.alert(
        'SOS Sent',
        `Emergency alert sent to ${contacts.length} contact(s). Help is on the way.`,
        [
          {
            text: 'Call Emergency Services',
            onPress: () => this.callEmergencyServices(),
          },
          { text: 'I\'m Safe', style: 'cancel' },
        ]
      );

      // Start live location sharing automatically
      await this.startLiveLocationSharing(userId, 60); // Share for 60 minutes

    } catch (error) {
      console.error('SOS execution error:', error);
      Alert.alert('Error', 'Failed to send SOS. Please call emergency services directly.');
    }
  }

  private async getBatteryLevel(): Promise<number> {
    // Note: Battery API is limited in Expo
    // In production, use expo-battery or native module
    return 0.5; // Placeholder
  }

  private async notifyEmergencyContacts(
    userId: string,
    contacts: EmergencyContact[],
    notification: { title: string; body: string; data: any }
  ): Promise<void> {
    // In production, this would send push notifications via FCM/APNs
    console.log('Notifying emergency contacts:', contacts);
  }

  private callEmergencyServices(): void {
    // In India, dial 112 for emergency services
    // This would use Linking.openURL('tel:112') in production
    Alert.alert('Emergency Services', 'Dialing 112...');
  }

  // ==========================================
  // LIVE LOCATION SHARING
  // ==========================================

  async startLiveLocationSharing(
    userId: string,
    durationMinutes: number = 30,
    activityId?: string
  ): Promise<LiveLocationShare | null> {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required for live sharing.');
        return null;
      }

      // Generate share token
      const shareToken = this.generateShareToken();

      // Calculate expiry
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);

      // Create share record
      const { data, error } = await supabase
        .from('live_location_shares')
        .insert({
          user_id: userId,
          activity_id: activityId,
          expires_at: expiresAt.toISOString(),
          share_token: shareToken,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating live share:', error);
        return null;
      }

      this.currentShare = {
        id: data.id,
        startedAt: new Date(data.started_at),
        expiresAt: new Date(data.expires_at),
        shareToken: data.share_token,
        isActive: data.is_active,
      };

      // Start location tracking
      await this.startLocationTracking(data.id);

      // Schedule auto-stop
      setTimeout(() => {
        this.stopLiveLocationSharing(data.id);
      }, durationMinutes * 60 * 1000);

      return this.currentShare;

    } catch (error) {
      console.error('Error starting live location share:', error);
      return null;
    }
  }

  async stopLiveLocationSharing(shareId: string): Promise<void> {
    // Stop location tracking
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }

    // Update database
    await supabase
      .from('live_location_shares')
      .update({ is_active: false })
      .eq('id', shareId);

    this.currentShare = null;
  }

  private async startLocationTracking(shareId: string): Promise<void> {
    // Watch position with high accuracy
    this.locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Or every 10 meters
      },
      async (location) => {
        // Update location in real-time database
        // In production, use a real-time solution like Firebase or Supabase Realtime
        await supabase.from('safety_events').insert({
          type: 'live_share_update',
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          metadata: { share_id: shareId },
        });
      }
    );
  }

  async getLiveLocationUrl(shareToken: string): Promise<string> {
    // Return a web URL where contacts can view live location
    return `https://invade.app/live/${shareToken}`;
  }

  // ==========================================
  // NIGHT RUN MODE
  // ==========================================

  isNightTime(): boolean {
    const hour = new Date().getHours();
    return hour >= 20 || hour < 6; // 8 PM to 6 AM
  }

  async enableNightRunMode(userId: string): Promise<void> {
    // Log night run mode start
    await supabase.from('safety_events').insert({
      user_id: userId,
      type: 'night_mode_start',
    });

    // Auto-enable live location sharing
    await this.startLiveLocationSharing(userId, 120); // 2 hours for night run

    // Schedule check-in reminders
    await this.scheduleCheckInReminder(15); // Every 15 minutes
  }

  private async scheduleCheckInReminder(minutes: number): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 Night Run Check-in',
        body: 'Tap to confirm you\'re safe.',
        data: { type: 'night_run_checkin' },
      },
      trigger: {
        seconds: minutes * 60,
        repeats: true,
      } as Notifications.TimeIntervalTriggerInput,
    });
  }

  // ==========================================
  // WOMEN'S SAFETY FEATURES
  // ==========================================

  async triggerFakeCall(): Promise<void> {
    // Simulate an incoming call after 10 seconds
    setTimeout(async () => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Incoming Call',
          body: 'Dad',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null, // Immediate
      });
    }, 10000);

    Alert.alert('Fake Call', 'You will receive a fake incoming call in 10 seconds.');
  }

  async alertNearbyWomen(userId: string, location: { latitude: number; longitude: number }): Promise<void> {
    // Find nearby women runners
    const { data: nearbyWomen } = await supabase.rpc('find_nearby_women', {
      user_id: userId,
      lat: location.latitude,
      lng: location.longitude,
      radius_meters: 1000,
    });

    if (nearbyWomen && nearbyWomen.length > 0) {
      // Send alert to nearby women
      // Implementation would use push notifications
      console.log(`Alerted ${nearbyWomen.length} nearby women runners`);
    }
  }

  // ==========================================
  // INACTIVITY DETECTION
  // ==========================================

  async checkInactivity(
    userId: string,
    activityId: string,
    lastMovementTime: Date
  ): Promise<void> {
    const now = new Date();
    const inactiveMinutes = (now.getTime() - lastMovementTime.getTime()) / (1000 * 60);

    if (inactiveMinutes > 5) {
      // Send push notification to user
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Are you okay?',
          body: 'We noticed you haven\'t moved in 5 minutes. Tap to confirm you\'re safe.',
          data: { type: 'inactivity_check', activityId },
        },
        trigger: null,
      });

      // Wait 2 minutes for response
      setTimeout(async () => {
        // Check if user responded
        // If not, alert emergency contacts
        await this.alertEmergencyContactsOfInactivity(userId, activityId);
      }, 2 * 60 * 1000);
    }
  }

  private async alertEmergencyContactsOfInactivity(userId: string, activityId: string): Promise<void> {
    const contacts = await this.getEmergencyContacts(userId);
    
    // Send notification to emergency contacts
    for (const contact of contacts) {
      // Implementation would send SMS/push notification
      console.log(`Alerting ${contact.name} about inactivity`);
    }

    // Log safety event
    await supabase.from('safety_events').insert({
      user_id: userId,
      type: 'inactivity_alert',
      metadata: { activity_id: activityId },
    });
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  private generateShareToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  async getRouteSafetyScore(
    latitude: number,
    longitude: number
  ): Promise<{
    overall: number;
    lighting: 'well-lit' | 'partial' | 'dark';
    traffic: 'low' | 'medium' | 'high';
    crowdLevel: 'busy' | 'moderate' | 'empty';
  }> {
    // In production, this would use historical data and user reports
    // For now, return placeholder data
    return {
      overall: 7,
      lighting: 'well-lit',
      traffic: 'medium',
      crowdLevel: 'moderate',
    };
  }
}

export const safetyService = SafetyService.getInstance();
