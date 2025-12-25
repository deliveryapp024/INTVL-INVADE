export let locationCallback: (location: any) => void;

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  watchPositionAsync: jest.fn((options, callback) => {
    locationCallback = callback;
    return Promise.resolve({
      remove: jest.fn(),
    });
  }),
  Accuracy: {
    High: 4,
  },
}));

jest.mock('expo-task-manager', () => ({
  isTaskRegisteredAsync: jest.fn(() => Promise.resolve(false)),
  registerBackgroundTaskAsync: jest.fn(() => Promise.resolve()),
  unregisterTaskAsync: jest.fn(() => Promise.resolve()),
}));