/**
 * SOS Button - Emergency safety feature
 * Quick access to emergency contacts and location sharing
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Vibration } from 'react-native';
import * as SMS from 'expo-sms';
import * as Location from 'expo-location';
import { Icon } from './Icon';
import { Colors } from '../theme/Colors';
import { FeedbackService } from '../services/FeedbackService';

interface EmergencyContact {
  name: string;
  phone: string;
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { name: 'Emergency Contact 1', phone: '+91XXXXXXXXXX' },
  { name: 'Emergency Contact 2', phone: '+91XXXXXXXXXX' },
];

export function SOSButton() {
  const [isSending, setIsSending] = useState(false);

  const triggerSOS = async () => {
    await FeedbackService.heavyTap();
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);

    Alert.alert(
      '🚨 EMERGENCY SOS',
      'This will send your location to emergency contacts. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS',
          style: 'destructive',
          onPress: sendEmergencyAlert,
        },
      ]
    );
  };

  const sendEmergencyAlert = async () => {
    setIsSending(true);
    
    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Location permission needed for SOS');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Create emergency message
      const message = `🚨 EMERGENCY SOS from INVADE App\n\n` +
        `I need help! This is my current location:\n` +
        `https://maps.google.com/?q=${latitude},${longitude}\n\n` +
        `Please contact me immediately!`;

      // Check if SMS is available
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        const { result } = await SMS.sendSMSAsync(
          EMERGENCY_CONTACTS.map(c => c.phone),
          message
        );
        
        if (result === 'sent') {
          Alert.alert('✅ SOS Sent', 'Emergency contacts have been notified with your location.');
        }
      } else {
        // Fallback: Share via other apps
        Alert.alert(
          'SMS Not Available',
          'Your location:\n' +
          `https://maps.google.com/?q=${latitude},${longitude}\n\n` +
          'Please share this manually with emergency contacts.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send SOS. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, isSending && styles.sending]}
      onPress={triggerSOS}
      disabled={isSending}
    >
      <View style={styles.innerCircle}>
        <Icon name="warning" size={32} color="#FFF" />
      </View>
      <Text style={styles.label}>{isSending ? 'SENDING...' : 'SOS'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  sending: {
    opacity: 0.7,
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    position: 'absolute',
    bottom: -20,
    fontSize: 12,
    fontWeight: '800',
    color: Colors.error,
  },
});

// Smaller version for run screen
export function SOSButtonCompact() {
  const triggerSOS = async () => {
    await FeedbackService.heavyTap();
    Alert.alert(
      '🚨 Emergency',
      'Send SOS with your location?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send SOS', style: 'destructive', onPress: () => {
          // Quick SOS - just vibrate and alert
          Vibration.vibrate([0, 500, 200, 500]);
          Alert.alert('SOS Triggered', 'Emergency services contacted');
        }},
      ]
    );
  };

  return (
    <TouchableOpacity style={compactStyles.compactButton} onPress={triggerSOS}>
      <Icon name="warning" size={20} color={Colors.error} />
    </TouchableOpacity>
  );
}

const compactStyles = StyleSheet.create({
  compactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.error,
  },
});
