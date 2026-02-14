/**
 * Offline Indicator
 * Shows when app is offline with retry option
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Icon } from './Icon';
import { Colors } from '../theme/Colors';
import { FeedbackService } from '../services/FeedbackService';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const translateY = React.useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected;
      setIsOffline(offline);
      
      Animated.spring(translateY, {
        toValue: offline ? 0 : -50,
        useNativeDriver: true,
      }).start();
    });

    return () => unsubscribe();
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    await FeedbackService.buttonPress('light');
    
    const state = await NetInfo.fetch();
    setIsOffline(!state.isConnected);
    
    setTimeout(() => setIsChecking(false), 1000);
  };

  if (!isOffline) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View style={styles.content}>
        <Icon name="cloud-offline" size={20} color={Colors.warning} />
        <Text style={styles.text}>You're offline</Text>
        <TouchableOpacity 
          style={[styles.retryButton, isChecking && styles.retrying]}
          onPress={checkConnection}
          disabled={isChecking}
        >
          <Text style={styles.retryText}>{isChecking ? 'Checking...' : 'Retry'}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.warning + '20',
    borderBottomWidth: 1,
    borderBottomColor: Colors.warning,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warning,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.warning,
    borderRadius: 12,
  },
  retrying: {
    opacity: 0.7,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
});
