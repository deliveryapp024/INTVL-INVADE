/**
 * Weather Widget - Compact version for Home Screen
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Icon } from './Icon';
import { Colors } from '../theme/Colors';

interface WeatherData {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  humidity: number;
  aqi: number;
  recommendation: string;
}

const fetchWeather = async (): Promise<WeatherData> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    temp: 28,
    condition: 'sunny',
    humidity: 65,
    aqi: 85,
    recommendation: 'Great time to run!',
  };
};

const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case 'sunny': return 'sunny';
    case 'cloudy': return 'cloud';
    case 'rainy': return 'rainy';
    case 'stormy': return 'thunderstorm';
    default: return 'partly-sunny';
  }
};

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return Colors.success;
  if (aqi <= 100) return Colors.warning;
  return Colors.error;
};

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      const data = await fetchWeather();
      setWeather(data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  if (!weather) return null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Icon name={getWeatherIcon(weather.condition)} size={28} color={Colors.warning} />
        <Text style={styles.temp}>{weather.temp}°C</Text>
      </View>
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Icon name="leaf" size={12} color={getAQIColor(weather.aqi)} />
          <Text style={[styles.detailText, { color: getAQIColor(weather.aqi) }]}>
            AQI {weather.aqi}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  temp: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  details: {
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
