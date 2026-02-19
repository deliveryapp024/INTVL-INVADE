// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { Colors } from '../../src/theme/Colors';
import { useTheme } from '../../src/theme/ThemeContext';
import { useState } from 'react';
import { RecordModal } from '../../src/components/RecordModal';
import { FeedbackService } from '../../src/services/FeedbackService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function TabBarIcon({ name, color, size = 24 }: { name: any; color: string; size?: number }) {
  return <Icon name={name} size={size} color={color} />;
}

function RecordButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.recordButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.recordButtonInner}>
        <Icon name="play-circle" size={32} color="#FFF" />
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [showRecordModal, setShowRecordModal] = useState(false);

  const handleRecordPress = async () => {
    await FeedbackService.buttonPress('medium');
    setShowRecordModal(true);
  };

  const handleCloseModal = () => {
    setShowRecordModal(false);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            {
              backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
              borderTopColor: isDark ? '#2A2A3E' : '#E5E5E5',
              paddingBottom: insets.bottom,
              height: 70 + insets.bottom,
            },
          ],
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: isDark ? '#666666' : '#999999',
          tabBarLabelStyle: styles.tabLabel,
          tabBarIconStyle: styles.tabIcon,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <TabBarIcon name="compass" color={color} />,
          }}
        />
        <Tabs.Screen
          name="record"
          options={{
            title: '',
            tabBarButton: () => <RecordButton onPress={handleRecordPress} />,
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Community',
            tabBarIcon: ({ color }) => <TabBarIcon name="people" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
          }}
        />
      </Tabs>

      <RecordModal
        visible={showRecordModal}
        onClose={handleCloseModal}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  tabIcon: {
    marginTop: 8,
  },
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
