import { act, renderHook } from '@testing-library/react-native';
import { useActivityStore, ActivityState } from './activityStore';

describe('useActivityStore', () => {
  beforeEach(() => {
    act(() => {
      useActivityStore.getState().resetActivity();
    });
  });

  it('should initialize with IDLE state and zero metrics', () => {
    const { result } = renderHook(() => useActivityStore());
    expect(result.current.status).toBe(ActivityState.IDLE);
    expect(result.current.metrics.elapsedTime).toBe(0);
    expect(result.current.metrics.distance).toBe(0);
    expect(result.current.metrics.pace).toBe(0);
  });

  it('should transition to TRACKING when started', () => {
    const { result } = renderHook(() => useActivityStore());
    act(() => {
      result.current.startActivity();
    });
    expect(result.current.status).toBe(ActivityState.TRACKING);
  });

  it('should transition to PAUSED when paused', () => {
    const { result } = renderHook(() => useActivityStore());
    act(() => {
      result.current.startActivity();
      result.current.pauseActivity();
    });
    expect(result.current.status).toBe(ActivityState.PAUSED);
  });

  it('should transition back to TRACKING when resumed', () => {
    const { result } = renderHook(() => useActivityStore());
    act(() => {
      result.current.startActivity();
      result.current.pauseActivity();
      result.current.resumeActivity();
    });
    expect(result.current.status).toBe(ActivityState.TRACKING);
  });

  it('should transition to COMPLETED when finished', () => {
    const { result } = renderHook(() => useActivityStore());
    act(() => {
      result.current.startActivity();
      result.current.finishActivity();
    });
    expect(result.current.status).toBe(ActivityState.COMPLETED);
  });

  it('should store and reset coordinates', () => {
    const { result } = renderHook(() => useActivityStore());
    const coord = { latitude: 10, longitude: 20 };
    
    act(() => {
      result.current.addCoordinate(coord);
    });
    
    expect(result.current.coordinates).toContainEqual(coord);
    
    act(() => {
      result.current.resetActivity();
    });
    
    expect(result.current.coordinates).toHaveLength(0);
  });
});
