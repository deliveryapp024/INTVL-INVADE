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
}

export interface ActivityStore {
  status: ActivityState;
  metrics: ActivityMetrics;
  coordinates: Coordinate[];
  startActivity: () => void;
  pauseActivity: () => void;
  resumeActivity: () => void;
  finishActivity: () => void;
  resetActivity: () => void;
  updateMetrics: (metrics: Partial<ActivityMetrics>) => void;
  addCoordinate: (coordinate: Coordinate) => void;
}

export const useActivityStore = create<ActivityStore>((set) => ({
  status: ActivityState.IDLE,
  metrics: { elapsedTime: 0, distance: 0, pace: 0 },
  coordinates: [],
  startActivity: () => set({ status: ActivityState.TRACKING }),
  pauseActivity: () => set({ status: ActivityState.PAUSED }),
  resumeActivity: () => set({ status: ActivityState.TRACKING }),
  finishActivity: () => set({ status: ActivityState.COMPLETED }),
  resetActivity: () =>
    set({
      status: ActivityState.IDLE,
      metrics: { elapsedTime: 0, distance: 0, pace: 0 },
      coordinates: [],
    }),
  updateMetrics: (metrics) =>
    set((state) => ({
      metrics: { ...state.metrics, ...metrics },
    })),
  addCoordinate: (coordinate) =>
    set((state) => ({
      coordinates: [...state.coordinates, coordinate],
    })),
}));