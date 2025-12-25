import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { MinimalistMapStyle } from '../../../constants/MapStyles';
import { Colors } from '../../../constants/Colors';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface ActivityRouteMapProps {
  coordinates: Coordinate[];
  style?: any;
  interactive?: boolean;
}

const ActivityRouteMap: React.FC<ActivityRouteMapProps> = ({ coordinates, style, interactive = false }) => {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (coordinates.length > 0 && mapRef.current) {
      // Small timeout to ensure map is ready layout-wise
      const timer = setTimeout(() => {
          mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: false,
          });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [coordinates]);

  if (!coordinates || coordinates.length === 0) {
    return null;
  }

  const startPoint = coordinates[0];
  const endPoint = coordinates[coordinates.length - 1];

  // Use light theme accent for the route
  const routeColor = Colors.light.accent;

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        style={styles.map}
        customMapStyle={MinimalistMapStyle}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        pitchEnabled={interactive}
        rotateEnabled={interactive}
      >
        <Polyline
          coordinates={coordinates}
          strokeColor={routeColor}
          strokeWidth={4}
        />
        <Marker coordinate={startPoint} title="Start" anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.startMarker} />
        </Marker>
        <Marker coordinate={endPoint} title="End" anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.endMarker} />
        </Marker>
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.light.border, // Placeholder background while loading
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  startMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50', // Green
    borderWidth: 2,
    borderColor: 'white',
  },
  endMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F44336', // Red
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default ActivityRouteMap;
