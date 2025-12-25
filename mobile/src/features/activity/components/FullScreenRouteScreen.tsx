import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useActivityStore } from '../store/activityStore';
import ActivityRouteMap from './ActivityRouteMap';
import { Colors } from '../../../constants/Colors';

export default function FullScreenRouteScreen() {
  const { coordinates } = useActivityStore();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Route Detail', 
        headerShown: true,
        headerTintColor: Colors.light.text,
        headerBackTitleVisible: false,
      }} />
      
      <ActivityRouteMap 
        coordinates={coordinates} 
        style={styles.map}
        interactive={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
