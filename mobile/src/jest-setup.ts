jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

export let locationCallback: (location: any) => void;

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  watchPositionAsync: jest.fn((options, callback) => {
    locationCallback = callback;
    return Promise.resolve({
      remove: jest.fn(),
    });
  }),
  startLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
  stopLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
  Accuracy: {
    High: 4,
  },
}));

jest.mock('expo-task-manager', () => ({
  isTaskRegisteredAsync: jest.fn(() => Promise.resolve(false)),
  registerBackgroundTaskAsync: jest.fn(() => Promise.resolve()),
  unregisterTaskAsync: jest.fn(() => Promise.resolve()),
  defineTask: jest.fn(),
}));
