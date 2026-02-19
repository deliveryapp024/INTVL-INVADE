// src/components/RecordModal.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from './Icon';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { useTheme } from '../theme/ThemeContext';
import { FeedbackService } from '../services/FeedbackService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RecordModalProps {
  visible: boolean;
  onClose: () => void;
}

export function RecordModal({ visible, onClose }: RecordModalProps) {
  const router = useRouter();
  const { isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleStartRun = async () => {
    await FeedbackService.buttonPress('medium');
    onClose();
    setTimeout(() => {
      router.push('/run');
    }, 200);
  };

  const handleChooseRoute = async () => {
    await FeedbackService.buttonPress('light');
    onClose();
    // TODO: Navigate to route selection
    setTimeout(() => {
      // router.push('/explore?tab=routes');
    }, 200);
  };

  const handleSetGoal = async () => {
    await FeedbackService.buttonPress('light');
    onClose();
    // TODO: Show goal setting modal
  };

  const handleClose = async () => {
    await FeedbackService.lightTap();
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Pressable
        style={styles.backdrop}
        onPress={handleClose}
      >
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              opacity: fadeAnim,
            },
          ]}
        />
      </Pressable>

      {/* Modal Content */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Drag Handle */}
        <View style={styles.dragHandle}>
          <View style={[styles.dragHandleBar, { backgroundColor: isDark ? '#3A3A4E' : '#E5E5E5' }]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
            Start Running
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#888888' : '#666666' }]}>
            Choose how you want to begin
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {/* Start Run Now */}
          <TouchableOpacity
            style={[styles.optionButton, styles.primaryOption]}
            onPress={handleStartRun}
            activeOpacity={0.8}
          >
            <View style={[styles.optionIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Icon name="play-circle" size={28} color={Colors.primary} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Start Run Now</Text>
              <Text style={styles.optionSubtitle}>Begin immediately with GPS tracking</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Choose Route */}
          <TouchableOpacity
            style={[styles.optionButton, { backgroundColor: isDark ? '#2A2A3E' : '#F5F5F5' }]}
            onPress={handleChooseRoute}
            activeOpacity={0.8}
          >
            <View style={[styles.optionIcon, { backgroundColor: Colors.secondary + '20' }]}>
              <Icon name="map" size={24} color={Colors.secondary} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                Choose Route
              </Text>
              <Text style={[styles.optionSubtitle, { color: isDark ? '#888888' : '#666666' }]}>
                Select from saved or popular routes
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Set Goal */}
          <TouchableOpacity
            style={[styles.optionButton, { backgroundColor: isDark ? '#2A2A3E' : '#F5F5F5' }]}
            onPress={handleSetGoal}
            activeOpacity={0.8}
          >
            <View style={[styles.optionIcon, { backgroundColor: Colors.success + '20' }]}>
              <Icon name="trophy" size={24} color={Colors.success} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                Set Goal
              </Text>
              <Text style={[styles.optionSubtitle, { color: isDark ? '#888888' : '#666666' }]}>
                Distance, time, or pace target
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelText, { color: isDark ? '#888888' : '#666666' }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 8,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    ...Typography.h2,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  primaryOption: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 2,
    borderColor: Colors.primary + '30',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  optionSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelText: {
    ...Typography.body,
    fontWeight: '600',
  },
});
