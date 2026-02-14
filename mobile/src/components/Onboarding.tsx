/**
 * Onboarding Flow
 * First-time user experience
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from './Icon';
import { Button } from './Button';
import { Colors } from '../theme/Colors';
import { FeedbackService } from '../services/FeedbackService';

const { width, height } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    id: '1',
    title: 'Welcome to INVADE',
    subtitle: 'Turn your runs into territory battles',
    description: 'Capture zones, compete with friends, and conquer your city one run at a time.',
    icon: 'flag',
    color: Colors.primary,
  },
  {
    id: '2',
    title: 'Capture Zones',
    subtitle: 'Run to claim territory',
    description: 'Run through zones to capture them. The more you run, the more territory you control!',
    icon: 'map',
    color: Colors.success,
  },
  {
    id: '3',
    title: 'Compete & Win',
    subtitle: 'Climb the leaderboard',
    description: 'Compete with friends and runners in your city. Earn badges and become the ultimate zone master!',
    icon: 'trophy',
    color: Colors.warning,
  },
  {
    id: '4',
    title: 'Stay Safe',
    subtitle: 'Emergency features built-in',
    description: 'One-tap SOS button shares your location with emergency contacts. Run with confidence!',
    icon: 'shield',
    color: Colors.error,
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = async () => {
    await FeedbackService.buttonPress('light');
    
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    await FeedbackService.success();
    await AsyncStorage.setItem('@inv_onboarding_complete', 'true');
    onComplete();
  };

  const renderItem = ({ item }: { item: typeof ONBOARDING_STEPS[0] }) => {
    return (
      <View style={styles.slide}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Icon name={item.icon as any} size={64} color={item.color} />
        </View>
        
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {ONBOARDING_STEPS.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: 'clamp',
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                { 
                  backgroundColor: index === currentIndex ? Colors.primary : Colors.border,
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_STEPS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {renderDots()}

      <View style={styles.footer}>
        {currentIndex < ONBOARDING_STEPS.length - 1 ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={completeOnboarding}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <Button
              title="Next"
              onPress={handleNext}
              variant="primary"
              icon={<Icon name="arrow-forward" size={20} color="#FFF" />}
            />
          </View>
        ) : (
          <Button
            title="Start Invading!"
            onPress={completeOnboarding}
            variant="primary"
            size="large"
            icon={<Icon name="flag" size={24} color="#FFF" />}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
