export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface CoordinateInput {
  lat: string | number;
  lng: string | number;
}

export function toCoordinate(input: CoordinateInput): Coordinate {
  return {
    latitude: typeof input.lat === 'string' ? parseFloat(input.lat) : input.lat,
    longitude: typeof input.lng === 'string' ? parseFloat(input.lng) : input.lng
  };
}

export function isValidCoordinate(coord: Coordinate): boolean {
  return (
    !isNaN(coord.latitude) &&
    !isNaN(coord.longitude) &&
    coord.latitude >= -90 &&
    coord.latitude <= 90 &&
    coord.longitude >= -180 &&
    coord.longitude <= 180
  );
}
