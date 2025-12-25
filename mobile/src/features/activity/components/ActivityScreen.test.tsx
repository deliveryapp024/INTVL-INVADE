import { render, fireEvent } from '@testing-library/react-native';
import ActivityScreen from './ActivityScreen';
import { useActivityStore, ActivityState } from '../store/activityStore';
import { act } from 'react-test-renderer';

// Mock the hook to avoid location permission logic in UI tests
jest.mock('../hooks/useActivityTracking', () => ({
  useActivityTracking: jest.fn(),
}));

describe('ActivityScreen', () => {
  beforeEach(() => {
    act(() => {
      useActivityStore.getState().resetActivity();
    });
  });

  it('should display Start button when IDLE', () => {
    const { getByText } = render(<ActivityScreen />);
    expect(getByText('Start')).toBeTruthy();
  });

  it('should display metrics and Pause/Finish buttons when TRACKING', () => {
    act(() => {
      useActivityStore.getState().startActivity();
      useActivityStore.getState().updateMetrics({ elapsedTime: 10, distance: 100 });
    });

    const { getByText } = render(<ActivityScreen />);
    expect(getByText('00:10')).toBeTruthy(); // Formatted time
    expect(getByText('0.10 km')).toBeTruthy(); // Formatted distance
    expect(getByText('Pause')).toBeTruthy();
    expect(getByText('Finish')).toBeTruthy();
  });

  it('should display Resume/Finish buttons when PAUSED', () => {
    act(() => {
      useActivityStore.getState().startActivity();
      useActivityStore.getState().pauseActivity();
    });

    const { getByText } = render(<ActivityScreen />);
    expect(getByText('Resume')).toBeTruthy();
    expect(getByText('Finish')).toBeTruthy();
  });
});
