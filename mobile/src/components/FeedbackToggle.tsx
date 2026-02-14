/**
 * Feedback Toggle Component
 * Settings toggles for haptics and sounds
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Icon } from './Icon';
import { FeedbackService } from '../services/FeedbackService';
import { Colors } from '../theme/Colors';

interface FeedbackToggleProps {
  variant?: 'compact' | 'full';
}

export function FeedbackToggle({ variant = 'full' }: FeedbackToggleProps) {
  const [settings, setSettings] = useState({ haptics: true, sounds: true });

  useEffect(() => {
    setSettings(FeedbackService.getSettings());
  }, []);

  const toggleHaptics = async () => {
    const newValue = !settings.haptics;
    FeedbackService.setHapticsEnabled(newValue);
    setSettings(prev => ({ ...prev, haptics: newValue }));
    if (newValue) {
      await FeedbackService.mediumTap();
    }
  };

  const toggleSounds = async () => {
    const newValue = !settings.sounds;
    FeedbackService.setSoundsEnabled(newValue);
    setSettings(prev => ({ ...prev, sounds: newValue }));
    if (newValue) {
      await FeedbackService.playClick();
    }
  };

  if (variant === 'compact') {
    return (
      <View style={styles.compactContainer}>
        <TouchableOpacity
          style={[styles.compactButton, !settings.haptics && styles.disabled]}
          onPress={toggleHaptics}
        >
          <Icon name={settings.haptics ? 'vibrate' : 'vibrate-off'} size={20} color={settings.haptics ? Colors.primary : Colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.compactButton, !settings.sounds && styles.disabled]}
          onPress={toggleSounds}
        >
          <Icon name={settings.sounds ? 'volume-high' : 'volume-off'} size={20} color={settings.sounds ? Colors.primary : Colors.textMuted} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Feedback</Text>
      
      <View style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={toggleHaptics}>
          <View style={styles.iconContainer}>
            <Icon name="vibrate" size={22} color={Colors.primary} />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>Haptic Feedback</Text>
            <Text style={styles.subtitle}>Vibrations for interactions</Text>
          </View>
          <Switch
            value={settings.haptics}
            onValueChange={toggleHaptics}
            trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
            thumbColor={settings.haptics ? Colors.primary : Colors.textMuted}
          />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.row} onPress={toggleSounds}>
          <View style={styles.iconContainer}>
            <Icon name="volume-high" size={22} color={Colors.secondary} />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>Sound Effects</Text>
            <Text style={styles.subtitle}>Audio feedback for actions</Text>
          </View>
          <Switch
            value={settings.sounds}
            onValueChange={toggleSounds}
            trackColor={{ false: Colors.border, true: Colors.secondary + '50' }}
            thumbColor={settings.sounds ? Colors.secondary : Colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.testButton}
        onPress={async () => {
          await FeedbackService.fullCelebration();
        }}
      >
        <Icon name="flash" size={18} color={Colors.primary} />
        <Text style={styles.testText}>Test Feedback</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 72,
  },
  compactContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  compactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabled: {
    opacity: 0.5,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary + '15',
    borderRadius: 20,
    gap: 8,
  },
  testText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
