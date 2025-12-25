import React from 'react';
import { render } from '@testing-library/react-native';
import ActivityRouteMap from './ActivityRouteMap';

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MockMapView = (props: any) => {
    return <View testID="map-view" {...props}>{props.children}</View>;
  };
  const MockPolyline = (props: any) => <View testID="map-polyline" {...props} />;
  const MockMarker = (props: any) => <View testID="map-marker" {...props} />;
  
  return {
    __esModule: true,
    default: MockMapView,
    Polyline: MockPolyline,
    Marker: MockMarker,
    PROVIDER_GOOGLE: 'google',
  };
});

describe('ActivityRouteMap', () => {
  const mockCoordinates = [
    { latitude: 37.78825, longitude: -122.4324 },
    { latitude: 37.78845, longitude: -122.4344 },
  ];

  it('renders correctly', () => {
    const { getByTestId } = render(
      <ActivityRouteMap coordinates={mockCoordinates} />
    );
    expect(getByTestId('map-view')).toBeTruthy();
  });

  it('renders polyline with correct coordinates', () => {
    const { getByTestId } = render(
      <ActivityRouteMap coordinates={mockCoordinates} />
    );
    const polyline = getByTestId('map-polyline');
    expect(polyline.props.coordinates).toEqual(mockCoordinates);
  });

  it('renders start and end markers', () => {
    const { getAllByTestId } = render(
      <ActivityRouteMap coordinates={mockCoordinates} />
    );
    const markers = getAllByTestId('map-marker');
    expect(markers).toHaveLength(2); // Start and End
  });

  it('renders nothing when coordinates are empty', () => {
    const { toJSON } = render(<ActivityRouteMap coordinates={[]} />);
    expect(toJSON()).toBeNull();
  });
});
