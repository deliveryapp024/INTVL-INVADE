import { create } from 'zustand';

export enum ActivityState {
  IDLE = 'IDLE',
  TRACKING = 'TRACKING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

export interface ActivityMetrics {
  elapsedTime: number;
  distance: number;
  pace: number;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface Zone {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;
  captured: boolean;
  capturedBy?: string;
}

export interface ActivityStore {
  status: ActivityState;
  metrics: ActivityMetrics;
  coordinates: Coordinate[];
  zones: Zone[];
  startActivity: () => void;
  pauseActivity: () => void;
  resumeActivity: () => void;
  finishActivity: () => void;
  resetActivity: () => void;
  updateMetrics: (metrics: Partial<ActivityMetrics>) => void;
  addCoordinate: (coordinate: Coordinate) => void;
  setStatus: (status: ActivityState) => void;
  captureZone: (zoneId: string) => void;
  setZones: (zones: Zone[]) => void;
  reset: () => void;
}

// Mock zones for testing
const DEFAULT_ZONES: Zone[] = [
  { id: '1', latitude: 12.9716, longitude: 77.5946, radius: 100, captured: false },
  { id: '2', latitude: 12.9750, longitude: 77.5980, radius: 150, captured: false },
  { id: '3', latitude: 12.9680, longitude: 77.5900, radius: 120, captured: false },
];

export const useActivityStore = create<ActivityStore>((set) => ({
  status: ActivityState.IDLE,
  metrics: { elapsedTime: 0, distance: 0, pace: 0 },
  coordinates: [],
  zones: DEFAULT_ZONES,
  
  startActivity: () => set({ status: ActivityState.TRACKING }),
  pauseActivity: () => set({ status: ActivityState.PAUSED }),
  resumeActivity: () => set({ status: ActivityState.TRACKING }),
  finishActivity: () => set({ status: ActivityState.COMPLETED }),
  
  resetActivity: () =>
    set({
      status: ActivityState.IDLE,
      metrics: { elapsedTime: 0, distance: 0, pace: 0 },
      coordinates: [],
      zones: DEFAULT_ZONES,
    }),
  
  updateMetrics: (metrics) =>
    set((state) => ({
      metrics: { ...state.metrics, ...metrics },
    })),
  
  addCoordinate: (coordinate) =>
    set((state) => ({
      coordinates: [...state.coordinates, coordinate],
    })),
  
  setStatus: (status) => set({ status }),
  
  captureZone: (zoneId) =>
    set((state) => ({
      zones: state.zones.map((z) =>
        z.id === zoneId ? { ...z, captured: true } : z
      ),
    })),
  
  setZones: (zones) => set({ zones }),
  
  reset: () =>
    set({
      status: ActivityState.IDLE,
      metrics: { elapsedTime: 0, distance: 0, pace: 0 },
      coordinates: [],
      zones: DEFAULT_ZONES,
    }),
}));
