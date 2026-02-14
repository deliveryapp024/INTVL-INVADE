import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Polygon, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../services/api';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

type LatestRunResponse =
  | { status: 'success'; data: null }
  | {
      status: 'success';
      data: {
        id: string;
        userId: string;
        coordinates: { latitude: number; longitude: number }[];
      };
    };

type ZonesCurrentResponse = {
  status: 'success';
  data: {
    cycleKey: string;
    zones: {
      h3_index: string;
      owner_user_id: string;
      is_loop_bonus?: boolean;
      boundary?: { latitude: number; longitude: number }[];
    }[];
  };
};

const USER_ID = 'test-user-id';

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [runCoords, setRunCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [zones, setZones] = useState<ZonesCurrentResponse['data']['zones']>([]);
  const [cycleKey, setCycleKey] = useState<string | null>(null);
  const [showMyRuns, setShowMyRuns] = useState(true);

  const load = useCallback(async () => {
    const [runRes, zonesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/runs/latest?userId=${encodeURIComponent(USER_ID)}`),
      fetch(`${API_BASE_URL}/zones/current?userId=${encodeURIComponent(USER_ID)}`)
    ]);

    const runJson = (await runRes.json()) as LatestRunResponse;
    const zonesJson = (await zonesRes.json()) as ZonesCurrentResponse;

    setRunCoords(runJson.data?.coordinates ?? []);
    setZones(zonesJson.data?.zones ?? []);
    setCycleKey(zonesJson.data?.cycleKey ?? null);
  }, []);

  useEffect(() => {
    load().catch(() => {
      setRunCoords([]);
      setZones([]);
      setCycleKey(null);
    });
  }, [load]);

  const zonePolygons = useMemo(() => {
    return zones.map((z) => {
      const coordinates = z.boundary ?? [];
      return { ...z, coordinates };
    });
  }, [zones]);

  const ownedCount = useMemo(
    () => zones.filter((z) => z.owner_user_id === USER_ID).length,
    [zones]
  );

  const daysUntilReset = useMemo(() => {
    if (!cycleKey) return null;
    const start = new Date(`${cycleKey}T00:00:00Z`);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    const ms = end.getTime() - Date.now();
    const days = Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
    return days;
  }, [cycleKey]);

  useEffect(() => {
    const coords: { latitude: number; longitude: number }[] = [];
    for (const z of zonePolygons) coords.push(...z.coordinates);
    if (showMyRuns) coords.push(...runCoords);
    if (coords.length > 0) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 120, right: 40, bottom: 80, left: 40 },
          animated: false
        });
      }, 250);
    }
  }, [runCoords, showMyRuns, zonePolygons]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
      >
        {showMyRuns && runCoords.length > 0 ? (
          <Polyline coordinates={runCoords} strokeColor={Colors.light.text} strokeWidth={4} />
        ) : null}

        {zonePolygons.map((z) => {
          if (!z.coordinates || z.coordinates.length === 0) return null;
          const isMine = z.owner_user_id === USER_ID;
          const baseFill = isMine ? 'rgba(0, 122, 255, 0.45)' : 'rgba(52, 199, 89, 0.45)'; // blue/green
          const loopFill = 'rgba(255, 204, 0, 0.55)'; // yellow

          return (
            <React.Fragment key={z.h3_index}>
              <Polygon coordinates={z.coordinates} fillColor={baseFill} strokeColor="rgba(0,0,0,0)" />
              {z.is_loop_bonus ? (
                <Polygon coordinates={z.coordinates} fillColor={loopFill} strokeColor="rgba(0,0,0,0)" />
              ) : null}
            </React.Fragment>
          );
        })}
      </MapView>

      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Map</Text>
          <Text style={styles.subTitle}>
            {cycleKey ? `Week ${cycleKey}` : 'Week'}
            {typeof daysUntilReset === 'number' ? ` • resets in ${daysUntilReset}d` : ''}
          </Text>
          <Text style={styles.subTitle}>You captured {ownedCount} zones this week</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondary} onPress={() => setShowMyRuns((v) => !v)}>
            <Text style={styles.secondaryText}>{showMyRuns ? 'Hide runs' : 'Show runs'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cta} onPress={() => router.push('/run')}>
            <Text style={styles.ctaText}>Start Run</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={() => load().catch(() => {})}>
            <Text style={styles.secondaryText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  map: { ...StyleSheet.absoluteFillObject },
  topBar: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    gap: 12
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.light.text
  },
  subTitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
  },
  cta: {
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999
  },
  ctaText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.light.text
  },
  secondary: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.light.border
  },
  secondaryText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.light.text
  }
});
