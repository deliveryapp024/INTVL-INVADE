import { renderHook } from '@testing-library/react-native';
import { useActivityTracking } from './useActivityTracking';
import * as Location from 'expo-location';
import { useActivityStore, ActivityState } from '../store/activityStore';
import { act } from 'react-test-renderer';
import { locationCallback } from '../../../jest-setup';

jest.mock('../services/locationService', () => ({
  requestLocationPermissions: jest.fn(() => Promise.resolve(true)),
}));

describe('useActivityTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useActivityStore.getState().resetActivity();
    });
  });

  it('should start watching position when status is TRACKING', async () => {
    act(() => {
      useActivityStore.getState().startActivity();
    });

    renderHook(() => useActivityTracking());

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(Location.watchPositionAsync).toHaveBeenCalled();
  });

  it('should not start watching position when status is IDLE', async () => {
    renderHook(() => useActivityTracking());
    expect(Location.watchPositionAsync).not.toHaveBeenCalled();
  });

  it('should increment elapsedTime every second when TRACKING', async () => {
    jest.useFakeTimers();
    act(() => {
      useActivityStore.getState().startActivity();
    });

    renderHook(() => useActivityTracking());

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(useActivityStore.getState().metrics.elapsedTime).toBe(1);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(useActivityStore.getState().metrics.elapsedTime).toBe(3);
    jest.useRealTimers();
  });

  it('should update distance when location changes', async () => {
    act(() => {
      useActivityStore.getState().startActivity();
    });

    renderHook(() => useActivityTracking());

    // Wait for the async startTracking inside useEffect
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      locationCallback({
        coords: { latitude: 51.5074, longitude: -0.1278 },
      });
    });

    act(() => {
      locationCallback({
        coords: { latitude: 51.5080, longitude: -0.1280 },
      });
    });

    expect(useActivityStore.getState().metrics.distance).toBeGreaterThan(0);
  });

  it('should store coordinates when location changes', async () => {
    act(() => {
      useActivityStore.getState().startActivity();
    });

    renderHook(() => useActivityTracking());

    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
    });

    const mockCoord = { latitude: 51.5074, longitude: -0.1278 };
    act(() => {
      locationCallback({
        coords: mockCoord,
      });
    });

    expect(useActivityStore.getState().coordinates).toContainEqual(mockCoord);
  });
});
