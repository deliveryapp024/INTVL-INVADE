import React from 'react';
import { render } from '@testing-library/react-native';
import FullScreenRouteScreen from './FullScreenRouteScreen';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
  Stack: {
    Screen: ({ options }: any) => null,
  }
}));

jest.mock('./ActivityRouteMap', () => {
  const { View } = require('react-native');
  return (props: any) => <View testID="mock-route-map" {...props} />;
});

jest.mock('../store/activityStore', () => ({
    useActivityStore: () => ({
        coordinates: [{ latitude: 10, longitude: 20 }]
    })
}));

describe('FullScreenRouteScreen', () => {
  it('renders map with coordinates', () => {
    const { getByTestId } = render(<FullScreenRouteScreen />);
    expect(getByTestId('mock-route-map')).toBeTruthy();
  });
});
